import React from "react";
import "../styles/main.css";

const formatStars = (count) => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count;
};

const RepoItem = ({ repo }) => (
  <div className="repo-card">
    <h2 className="repo-title">{repo.name}</h2>
    <p className="repo-desc">{repo.description}</p>

    <div className="repo-meta">
      <img
        src={repo.owner.avatar_url}
        alt="avatar"
        className="avatar"
      />
      <span className="username">{repo.owner.login}</span>
      <span className="stars">★ {formatStars(repo.stargazers_count)}</span>
    </div>
  </div>
);

export default RepoItem;
