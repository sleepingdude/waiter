import React from "react";
import "./App.css";
import { Waiter } from "./Waiter/Waiter";
import { WaiterProvider } from "./Waiter/WaiterProvider";
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

const Loader = () => <div style={{ color: "gold" }}>Loading</div>;
const Errors = (...errors: Error[]) => (
  <div style={{ color: "red" }}>{errors.map((e) => e.toString())}</div>
);

function App() {
  return (
    <WaiterProvider>
      <div className="App">
        <Waiter
          requests={{
            user: toRequest(fetchUser, "userId"),
            posts: toRequest(fetchPost, 111)
          }}
          renderLoader={Loader}
          renderErrors={Errors}
        >
          {({ data, meta }) => {
            return (
              <div>
                User and Post Meta:
                {JSON.stringify(meta)}
                User and Post Data:
                {JSON.stringify(data)}
                <Waiter
                  requests={{
                    messages: toRequest(fetchMessages, 1111)
                  }}
                  renderLoader={Loader}
                  renderErrors={Errors}
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
                        <Waiter
                          requests={{
                            posts: toRequest(fetchPost, 111)
                          }}
                          renderLoader={Loader}
                          renderErrors={Errors}
                        >
                          {({ data }) => {
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
    </WaiterProvider>
  );
}

export default App;
