import React from "react";

const Button = ({ icon, handleClick, name, category }) => {
  return (
    <button
      onClick={handleClick}
      className={`text-xs rounded-md sm:text-sm group mt-4 flex items-center px-2.5 drop-shadow 
${
  category === name
    ? "bg-indigo-800 py-2.5 active:scale-95 transition-all"
    : "bg-zinc-700 py-2"
}`}
    >
      {icon} &nbsp; &nbsp; {name}
    </button>
  );
};

export default Button;
