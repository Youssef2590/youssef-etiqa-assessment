import React, { useEffect, useRef, useState } from "react";
import { useReposQuery } from "./repoService";
import RepoItem from "../../components/RepoItem";

const RepoList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useReposQuery();

  const loader = useRef();
  const [secondsLeft, setSecondsLeft] = useState(null);

  // Detect cooldown from latest page
  useEffect(() => {
    if (!data || !data.pages) return;

    const lastPage = data.pages[data.pages.length - 1];

    if (lastPage.cooldownActive && lastPage.cooldownUntil) {
      const interval = setInterval(() => {
        const remaining = Math.ceil((lastPage.cooldownUntil - Date.now()) / 1000);

        if (remaining <= 0) {
          clearInterval(interval);
          setSecondsLeft(null);

          // ✅ Refresh the page when cooldown ends
          window.location.reload();
        } else {
          setSecondsLeft(remaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [data]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <>
      {secondsLeft !== null && (
        <div style={{ color: "red", margin: "1rem 0", fontWeight: "bold", textAlign: "center" }}>
          ⚠️ Too many requests. Cooldown active.<br />
          Please wait <strong>{secondsLeft} seconds</strong>...
        </div>
      )}

      {data?.pages?.map((page, i) =>
        page.repos.map((repo) => <RepoItem key={`${i}-${repo.id}`} repo={repo} />)
      )}

      <div ref={loader}>
        {isFetchingNextPage && secondsLeft === null ? (
          <p>Loading more...</p>
        ) : secondsLeft === null ? (
          <p>Scroll to load more</p>
        ) : null}
      </div>
    </>
  );
};

export default RepoList;
