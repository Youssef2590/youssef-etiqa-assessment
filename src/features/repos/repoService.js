import { fetchStarredRepos } from "../../api/github";

const COOLDOWN_REQUEST_LIMIT = 7;
const COOLDOWN_REFRESH_LIMIT = 7;
const COOLDOWN_DURATION_MS = 1 * 30 * 1000;

const getCooldownUntil = () => parseInt(localStorage.getItem("cooldownUntil") || "0", 10);
const getRefreshCount = () => parseInt(localStorage.getItem("refreshCount") || "0", 10);

const setCooldown = () => {
  const until = Date.now() + COOLDOWN_DURATION_MS;
  localStorage.setItem("cooldownUntil", String(until));
  return until;
};

export const fetchReposWithCooldown = async (page, scrollCount) => {
  const now = Date.now();
  const cooldownUntil = getCooldownUntil();

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

  if (scrollCount >= COOLDOWN_REQUEST_LIMIT) {
    const until = setCooldown();
    return {
      repos: [],
      nextPage: page,
      hasMore: true,
      cooldownActive: true,
      cooldownUntil: until,
    };
  }

  return {
    repos,
    nextPage: page + 1,
    hasMore: repos.length > 0,
    cooldownActive: false,
    cooldownUntil: null,
  };
};

export const trackRefreshCount = () => {
  const count = getRefreshCount() + 1;
  localStorage.setItem("refreshCount", count);

  if (count >= COOLDOWN_REFRESH_LIMIT) {
    setCooldown();
    console.log("Cooldown triggered by refresh count:", count);
  }
};

export const resetCooldownState = () => {
  localStorage.removeItem("cooldownUntil");
  localStorage.removeItem("refreshCount");
  localStorage.removeItem("lastScrollTop");
};
