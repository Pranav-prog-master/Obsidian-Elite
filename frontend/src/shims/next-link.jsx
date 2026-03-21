import React from "react";
import { Link as RouterLink } from "react-router-dom";

export default function Link({ href, children, ...props }) {
  return (
    <RouterLink to={href} {...props}>
      {children}
    </RouterLink>
  );
}
