import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchStarredRepos } from "../../api/github";

const COOLDOWN_REQUEST_LIMIT = 5;
const COOLDOWN_DURATION_MS = 1 * 60 * 1000;

// Helpers to store in localStorage
const getCooldownData = () => {
  return {
    requestCount: parseInt(localStorage.getItem("requestCount") || "0", 10),
    cooldownUntil: parseInt(localStorage.getItem("cooldownUntil") || "0", 10),
  };
};

const setCooldownData = (requestCount, cooldownUntil) => {
  localStorage.setItem("requestCount", requestCount.toString());
  localStorage.setItem("cooldownUntil", cooldownUntil.toString());
};

const fetchWithCooldown = async (page = 1) => {
  const now = Date.now();
  const { requestCount, cooldownUntil } = getCooldownData();

  if (cooldownUntil && now < cooldownUntil) {
    return {
      repos: [],
      nextPage: page,
      hasMore: true,
      cooldownActive: true,
      cooldownUntil,
    };
  }

  const repos = await fetchStarredRepos(page);

  const newRequestCount = requestCount + 1;

  if (newRequestCount >= COOLDOWN_REQUEST_LIMIT) {
    const newCooldownUntil = Date.now() + COOLDOWN_DURATION_MS;
    setCooldownData(0, newCooldownUntil); // reset count, start cooldown
  } else {
    setCooldownData(newRequestCount, 0); // update count only
  }

  return {
    repos,
    nextPage: page + 1,
    hasMore: repos.length > 0,
    cooldownActive: false,
    cooldownUntil: null,
  };
};

export const useReposQuery = () =>
  useInfiniteQuery({
    queryKey: ["starredRepos"],
    queryFn: async ({ pageParam = 1 }) => fetchWithCooldown(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    retry: false,
  });
