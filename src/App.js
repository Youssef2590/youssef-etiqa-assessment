// src/App.jsx
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RepoList from "./features/repos/RepoList";
import "./styles/main.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <div className="container">
      <h1 className="app-title">Top Starred GitHub Repositories</h1>
      <RepoList />
    </div>
  </QueryClientProvider>
);

export default App;
