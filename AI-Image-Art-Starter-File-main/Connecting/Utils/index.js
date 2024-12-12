import React, { useState } from "react";
import OpenAI from "openai";
import axios from "axios";
import { useRouter } from "next/router";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY,
  dangerouslyAllowBrowser: true,
});

function extractImageUrls(imageArray) {
  return imageArray.map((image) => image.url);
}

export const REGISTER_USER = async (signUp) => {
  const { name, email, password, confirmPassword } = signUp;

  if (!name || !email || !password || !confirmPassword)
    return "Data is missing";
  if (password !== confirmPassword) return "Passwords do not match";

  try {
    const response = await axios
      .post("http://localhost:3000/api/auth/register", {
        username: name,
        email,
        password,
        confirmPassword,
      })
      .then((response) => console.log(response))
      .catch((error) => console.error(error));

    if (response.status >= 200 && response.status < 300) {
      window.location.href = "/";
    } else {
      return `Error: ${response.statusText}`;
    }
  } catch (error) {
    console.error("Error during registration:", error.message);
    return error.response?.data?.error || "Network error during registration.";
  }
};

export const LOGIN_USER = async (login) => {
  const { email, password } = login;

  if (!email || !password) return "Data is missing";

  try {
    const response = await axios({
      method: "POST",
      url: "/api/auth/login",
      withCredentials: true,
      data: {
        email: email,
        password: password,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      window.location.href = "/"; // Alternatively use router.push('/')
    } else {
      return `Error: ${response.statusText}`;
    }
  } catch (error) {
    console.error("Error during login:", error);
    return "Error occurred during login.";
  }
};

export const LOGOUT = async () => {
  try {
    const response = await axios({
      method: "GET",
      url: "/api/auth/logout",
      withCredentials: true,
    });

    if (response.status >= 200 && response.status < 300) {
      window.location.href = "/"; // Alternatively use router.push('/')
    } else {
      return `Error: ${response.statusText}`;
    }
  } catch (error) {
    console.error("Error during logout:", error);
    return "Error occurred during logout.";
  }
};

export const CHECK_AUTH = async () => {
  try {
    const response = await axios({
      method: "GET",
      url: "/api/auth/refetch",
      withCredentials: true,
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error checking auth:", error);
    return null;
  }
};

export const LIKE_POST = async (postID) => {
  const currentUser = await CHECK_AUTH();

  if (!currentUser) return "User is not authenticated";

  try {
    const response = await axios({
      method: "POST",
      url: `/api/post/like/${postID}`,
      withCredentials: true,
      data: {
        userId: currentUser._id,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      return `Error: ${response.statusText}`;
    }
  } catch (error) {
    console.error("Error liking post:", error);
    return "Error occurred while liking the post.";
  }
};

export const DISLIKE_POST = async (postID) => {
  const currentUser = await CHECK_AUTH();

  if (!currentUser) return "User is not authenticated";

  try {
    const response = await axios({
      method: "POST",
      url: `/api/post/dislike/${postID}`,
      withCredentials: true,
      data: {
        userId: currentUser._id,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      return `Error: ${response.statusText}`;
    }
  } catch (error) {
    console.error("Error disliking post:", error);
    return "Error occurred while disliking the post.";
  }
};

export const IMAGE_GENERATOR_V3 = async (promptv3) => {
  const currentUser = await CHECK_AUTH();

  if (!currentUser) return "User is not authenticated";

  const { prompt, negativePrompt, size, style } = promptv3;

  if (!prompt || !negativePrompt || !size || !style) {
    return "Data is Missing";
  }

  const LOWERCASE = style ? style.toLowerCase() : "defaultStyle";

  try {
    const AIImage = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: size,
      quality: "hd",
      n: 1,
      style: LOWERCASE,
    });

    if (AIImage.data[0].url) {
      const response = await axios({
        method: "POST",
        url: `/api/post/credit/v3/${currentUser._id}`,
        withCredentials: true,
        data: {
          prompt,
          negativePrompt: negativePrompt,
          revisedPrompt: AIImage.data[0].revised_prompt,
          size,
          style,
          imageURL: AIImage.data[0].url,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        await axios({
          method: "PUT",
          url: `/api/user/credit/${currentUser._id}`,
          withCredentials: true,
          data: {
            credit: Number(currentUser?.credit) - 1,
          },
        });
        return response;
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return "Error occurred during image generation.";
  }
};

export const IMAGE_GENERATOR_V2 = async (promptv2) => {
  const currentUser = await CHECK_AUTH();

  if (!currentUser) return "User is not authenticated";

  const { prompt, negativePrompt, size, n } = promptv2;

  if (!prompt || !negativePrompt || !size || !n) {
    return "Data is Missing";
  }

  try {
    const AIImage = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      size: size,
      n: Number(n),
    });

    const imageUrls = extractImageUrls(AIImage.data);

    if (imageUrls.length) {
      const response = await axios({
        method: "POST",
        url: `/api/post/credit/v2/${currentUser._id}`,
        withCredentials: true,
        data: {
          prompt,
          negativePrompt: negativePrompt,
          size,
          n,
          imageUrls: imageUrls,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        await axios({
          method: "PUT",
          url: `/api/user/credit/${currentUser._id}`,
          withCredentials: true,
          data: {
            credit: Number(currentUser?.credit) - 1,
          },
        });
        return response;
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return "Error occurred during image generation.";
  }
};

export const GET_AI_IMAGES = async () => {
  try {
    const response = await axios({
      method: "GET",
      url: `/api/post/all`,
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data.posts;
    } else {
      return `Error: ${response.statusText}`;
    }
  } catch (error) {
    console.error("Error fetching AI images:", error);
    return "Error occurred while fetching AI images.";
  }
};

export const GET_USER_AI_IMAGES = async (userId) => {
  try {
    const response = await axios({
      method: "GET",
      url: `/api/post/user/${userId}`,
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data.posts;
    } else {
      return `Error: ${response.statusText}`;
    }
  } catch (error) {
    console.error("Error fetching user AI images:", error);
    return "Error occurred while fetching user AI images.";
  }
};

export const GET_SINGLE_POST = async (postId) => {
  try {
    const response = await axios({
      method: "GET",
      url: `/api/post/single/${postId}`,
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data.returnPost;
    } else {
      return `Error: ${response.statusText}`;
    }
  } catch (error) {
    console.error("Error fetching post:", error);
    return "Error occurred while fetching post.";
  }
};

export const DELETE_POST = async (postId) => {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/api/post/delete/${postId}`,
    });

    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      return `Error: ${response.statusText}`;
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    return "Error occurred while deleting post.";
  }
};

export const BUYING_CREDIT = async (CREDIT) => {
  const currentUser = await CHECK_AUTH();

  if (!currentUser) return "User is not authenticated";

  try {
    const response = await axios({
      method: "PUT",
      url: `/api/user/credit/${currentUser._id}`,
      withCredentials: true,
      data: {
        credit: Number(currentUser?.credit) + Number(CREDIT),
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      return `Error: ${response.statusText}`;
    }
  } catch (error) {
    console.error("Error buying credit:", error);
    return "Error occurred while buying credit.";
  }
};
