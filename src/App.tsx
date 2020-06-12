import React from "react";
import "./App.css";
import { Waiter } from "./Waiter/Waiter";
import { WaiterProvider } from "./Waiter/WaiterProvider";
import { toRequest } from "./Waiter/toRequest";
import { createStore, Store } from "./Waiter/store";
import { useCall } from "./Waiter/useCall";

type User = {
  id: string;
  name: string;
};

const fetchUser = async (id: string): Promise<User> => {
  return await new Promise((resolve) =>
    setTimeout(() => resolve({ id, name: "UserName" }), 2000)
  );
};

const updateUser = async (id: string): Promise<User> => {
  return await new Promise((resolve) =>
    setTimeout(() => resolve({ id, name: "UserName" + Math.random() }), 2000)
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
//
// const fetchMessages = async (id: number): Promise<Message[]> => {
//   return await new Promise((resolve, reject) =>
//     setTimeout(() => reject(new Error("Some error")), 2000)
//   );
// };

const Loader = () => <div style={{ color: "gold" }}>Loading</div>;
const Errors = (errors: Error[]) => (
  <div style={{ color: "red" }}>{errors.map((e) => e.toString())}</div>
);

const myAction = async (store: Store) => {
  console.log(store);

  return (await new Promise((resolve) =>
    setTimeout(() => resolve({ success: "Message" }), 2000)
  )) as { success: string };
};

const store = createStore();

function App() {
  return (
    <WaiterProvider store={store}>
      <div className="App">
        <Waiter
          requests={{
            user: toRequest(fetchUser, "userId"),
            posts: toRequest(fetchPost, 111),
            someAction: myAction
          }}
          mutations={{
            user: updateUser,
            someOtherMutation: myAction
          }}
          renderLoader={Loader}
          renderErrors={Errors}
        >
          {({ data, meta, update, mutations }) => {
            return (
              <div>
                <h4>Data:</h4>
                User:
                {JSON.stringify(data.user)}
                Post:
                {JSON.stringify(data.posts)}
                <h4>Meta:</h4>
                User:
                {JSON.stringify(meta.user)}
                Post:
                {JSON.stringify(meta.posts)}
                Some Action:
                {JSON.stringify(meta.someAction)}
                Some Mutation:
                {JSON.stringify(meta.someOtherMutation)}
                <Waiter
                  requests={{
                    messages: toRequest(fetchMessages, 1111)
                  }}
                  mutations={{
                    user: updateUser,
                    someOtherMutation: myAction
                  }}
                  renderLoader={Loader}
                  renderErrors={Errors}
                >
                  {({ data, update, call, mutations }) => {
                    console.log("render 2");

                    const _call = useCall();

                    return (
                      <div
                        onClick={async () => {
                          // const result = await call({
                          //   user: toRequest(fetchUser, "userId111")
                          // });
                          //
                          // const result = await _call({
                          //   user: toRequest(fetchUser, "userId" + Math.random())
                          // });

                          // type rr = typeof result;
                          // console.log(result);

                          const mm = await mutations.user("111" + new Date());

                          console.log(mm);

                          // update.messages([...data.messages, ...data.messages]);
                        }}
                      >
                        Click:
                        {JSON.stringify(data)}
                        <Waiter
                          requests={{
                            posts: toRequest(fetchPost, 111)
                          }}
                          renderLoader={Loader}
                          renderErrors={Errors}
                        >
                          {({ data }) => {
                            console.log("render 3");
                            return (
                              <div>
                                <div>
                                  Cashed Posts
                                  {JSON.stringify(data)}
                                </div>
                                <div style={{ display: "flex" }}>
                                  <Waiter
                                    requests={{
                                      user: toRequest(fetchUser, "111")
                                    }}
                                    renderLoader={Loader}
                                    renderErrors={Errors}
                                  >
                                    {({ data }) => {
                                      return (
                                        <div style={{ width: "50%" }}>
                                          {(() => {
                                            throw new Error("error");
                                            return null;
                                          })()}
                                          Cashed User
                                          {JSON.stringify(data)}
                                        </div>
                                      );
                                    }}
                                  </Waiter>
                                  <Waiter
                                    requests={{
                                      messages: toRequest(fetchMessages, 11)
                                    }}
                                    renderLoader={Loader}
                                    renderErrors={Errors}
                                  >
                                    {({ data }) => {
                                      return (
                                        <div style={{ width: "50%" }}>
                                          Cashed messages
                                          {JSON.stringify(data)}
                                        </div>
                                      );
                                    }}
                                  </Waiter>
                                </div>
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
