import React from "react";
import "./App.css";
import { Waiter } from "./Waiter/Waiter";
import { Provider } from "./Waiter/Provider";
import { toRequest } from "./Waiter/toRequest";

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
    <Provider>
      <div className="App">
        <Waiter
          requests={{
            user: toRequest(fetchUser, "userId"),
            posts: toRequest(fetchPost, 111)
          }}
          renderLoader={() => <div>Loading</div>}
        >
          {({ data }) => {
            console.log("rerender 1");
            return (
              <div>
                User and Posts:
                {JSON.stringify(data)}
                <Waiter
                  requests={{
                    messages: toRequest(fetchMessages, 1111)
                  }}
                  renderLoader={() => <div>Loading</div>}
                >
                  {({ data, update }) => {
                    console.log("rerender 2");
                    return (
                      <div
                        onClick={() => {
                          update.messages([...data.messages, ...data.messages]);
                        }}
                      >
                        Click for update Messages:
                        {JSON.stringify(data)}
                        <Waiter
                          requests={{
                            posts: toRequest(fetchPost, 111)
                          }}
                          renderLoader={() => <div>Loading</div>}
                          renderRuntimeError={() => <div>Ohhh</div>}
                        >
                          {({ data }) => {
                            console.log("rerender 3");
                            return (
                              <div>
                                {(() => {
                                  throw new Error("error");
                                  return null;
                                })()}
                                Cashed Posts
                                {JSON.stringify(data)}
                              </div>
                            );
                          }}
                        </Waiter>
                      </div>
                    );
                  }}
                </Waiter>
              </div>
            );
          }}
        </Waiter>
      </div>
    </Provider>
  );
}

export default App;
