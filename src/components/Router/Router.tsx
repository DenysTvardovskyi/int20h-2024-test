import { FC, useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import * as Page from "../../pages";
import { useApi, useAuthorization } from "../../hooks";

interface IProps {}

export const Router: FC<IProps> = (): JSX.Element => {

  const api = useApi();
  const { isAuthorized, setUser } = useAuthorization();

  useEffect(() => {
    if (isAuthorized) {
      api.account.get({}).then((user) => setUser(user));
    }
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Page.Home />} />
        <Route path="/sign-in" element={<Page.SignIn />} />
        <Route path="/sign-up" element={<Page.SignUp />} />
        <Route path="/auctions/:id" element={<Page.Auction />} />
        <Route path="/auctions/create" element={<Page.AuctionCreate />} />
        <Route path="*" element={<Page.NotFound />} />
      </Routes>
    </HashRouter>
  );
};
