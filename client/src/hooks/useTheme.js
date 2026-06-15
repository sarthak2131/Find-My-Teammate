import { useEffect, useState } from "react";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("fmt-theme");
  if (savedTheme) {
    return savedTheme;
  }

  return "light";
};

export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("fmt-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return { theme, toggleTheme };
}
