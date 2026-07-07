import React from "react";

const Logo: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
  <img
    src="/favourite-myanmar-logo.png"
    alt="Favourite Myanmar Co.,Ltd. Logo"
    {...props}
  />
);

export default Logo;
