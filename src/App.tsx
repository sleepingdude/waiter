import React from "react";
import "./App.css";
import { Fetcher } from "./Fetcher/Fetcher";
import { FetcherProvider } from "./Fetcher/FetcherProvider";
import { toRequest } from "./Fetcher/toRequest";

type User = {
  id: string;
  name: string;
};

const fetchUser = async (id: string): Promise<User> => {
  return await new Promise((resolve) =>
    setTimeout(() => resolve({ id, name: "UserName" }), 2000)
  );
};

type Post = {
  id: number;
  text: string;
};

const fetchPost = async (id: number): Promise<Post[]> => {
  return await new Promise((resolve) =>
    setTimeout(() => resolve([{ id, text: "Post" }]), 2000)
  );
};

type Message = {
  id: number;
  message: string;
};

const fetchMessages = async (id: number): Promise<Message[]> => {
  return await new Promise((resolve) =>
    setTimeout(() => resolve([{ id, message: "Message" }]), 2000)
  );
};

function App() {
  return (
    <FetcherProvider>
      <div className="App">
        <Fetcher
          requests={{
            user: toRequest(fetchUser, "userId"),
            posts: toRequest(fetchPost, 111)
          }}
        >
          {({ data }) => {
            return (
              <div>
                User and Posts:
                {JSON.stringify(data)}
                <Fetcher
                  requests={{
                    messages: toRequest(fetchMessages, 1111)
                  }}
                >
                  {({ data, update }) => {
                    return (
                      <div
                        onClick={() => {
                          update.messages([...data.messages, ...data.messages]);
                        }}
                      >
                        Click for update Messages:
                        {JSON.stringify(data)}
                        <Fetcher
                          requests={{
                            posts: toRequest(fetchPost, 111)
                          }}
                        >
                          {({ data }) => {
                            return (
                              <div>
                                Cashed Posts
                                {JSON.stringify(data)}
                              </div>
                            );
                          }}
                        </Fetcher>
                      </div>
                    );
                  }}
                </Fetcher>
              </div>
            );
          }}
        </Fetcher>
      </div>
    </FetcherProvider>
  );
}

export default App;
