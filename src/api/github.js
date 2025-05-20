import axios from "axios";

export const fetchStarredRepos = async (page = 1) => {
  const fixedDate = "2024-07-15"; // Fixed current date

  const res = await axios.get(
    `https://api.github.com/search/repositories?q=created:>${fixedDate}&sort=stars&order=desc&page=${page}`
  );

  return res.data.items;
};
