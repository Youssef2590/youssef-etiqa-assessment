import React, { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchReposWithCooldown,
  resetCooldownState,
} from "./repoService";
import RepoItem from "../../components/RepoItem";
import Modal from "../../components/Modal";

const RepoList = () => {
  const loader = useRef();

  const [scrollCount, setScrollCount] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);

  // On load: track refreshes and restore scroll position
  useEffect(() => {
    const storedUntil = parseInt(localStorage.getItem("cooldownUntil") || "0", 10);
    if (storedUntil && storedUntil > Date.now()) {
      setCooldownUntil(storedUntil);
    }
  }, []);

  // React Query call
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["repos"],
    queryFn: async ({ pageParam = 1 }) => fetchReposWithCooldown(pageParam, scrollCount),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextPage : undefined),
    retry: false,
  });

  // If cooldown triggered from fetch
  useEffect(() => {
    if (!data || !data.pages) return;

    const latest = data.pages[data.pages.length - 1];
    if (latest.cooldownActive && latest.cooldownUntil) {
      setCooldownUntil(latest.cooldownUntil);
    }
  }, [data]);

  useEffect(() => {
    if (!cooldownUntil) return;
  
    const interval = setInterval(() => {
      const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);
  
      if (remaining <= 0) {
        setCooldownUntil(null);
        setSecondsLeft(null);
        setScrollCount(0);
  
        resetCooldownState();
  
        // croll to end of page after cooldown ends
        setTimeout(() => {
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
        }, 50);
      } else {
        setSecondsLeft(remaining);
      }
    }, 1000);
  
    return () => clearInterval(interval);
  }, [cooldownUntil]);
   

  // nfinite scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !cooldownUntil) {
          setScrollCount((prev) => prev + 1);
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, cooldownUntil]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <>
      {cooldownUntil && secondsLeft !== null && (
        <Modal>
          <h2>⚠️ Too Many Requests</h2>
          <p>Please wait <strong>{secondsLeft}</strong> seconds before continuing.</p>
        </Modal>
      )}

      {!cooldownUntil &&
        data?.pages?.map((page, i) =>
          page.repos.map((repo) => <RepoItem key={`${i}-${repo.id}`} repo={repo} />)
        )}

      {!cooldownUntil && (
        <div ref={loader}>
          {isFetchingNextPage ? <p>Loading more...</p> : <p>Scroll to load more</p>}
        </div>
      )}
    </>
  );
};

export default RepoList;
