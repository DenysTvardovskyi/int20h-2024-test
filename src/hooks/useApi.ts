import { useMemo } from "react";
import { useHTTP } from "./useHTTP";
import { useAuthorization } from "./useAuthorization";
import { AxiosRequestHeaders } from "axios";
import { IUser } from "../models";
import { IAuction, IBid, IMessage } from "../models/auction";

const API_URL: string = "https://jwp-team.com/backend/api";

interface IApiConfig {
  loader?: boolean | string;
  debug?: boolean;
}

interface IApiAuthorizationSignUpConfig extends IApiConfig {
  email: string;
  fullname: string;
  password: string;
}

interface IApiAuthorizationSignInConfig extends IApiConfig {
  email: string;
  password: string;
}

interface IApiAuthorizationSignOutConfig extends IApiConfig {}

interface IApiAccountGetConfig extends IApiConfig {}

export interface IUseApi {
  authorization: {
    signUp: (config: IApiAuthorizationSignUpConfig) => Promise<void>;
    signIn: (config: IApiAuthorizationSignInConfig) => Promise<{ accessToken: string, user: IUser }>;
    signOut: (config: IApiAuthorizationSignOutConfig) => Promise<void>;
  };
  account: {
    get: (config: IApiAccountGetConfig) => Promise<IUser>;
  };
  auctions: {
    get: (config: any) => Promise<{ items: IAuction[], page: number, pageSize: number, totalCount: number }>,
    one: (config: any) => Promise<IAuction>
    create: (config: any) => Promise<IAuction>
  };
  message: {
    get: (config: any) => Promise<IMessage[]>
    send: (config: any) => Promise<void>
  };
  bids: {
    get: (config: any) => Promise<{ items: IBid[], page: number, pageSize: number, totalCount: number }>
    send: (config: any) => Promise<void>
  };
}

type TUseApi = () => IUseApi;

export const useApi: TUseApi = (): IUseApi => {
  const http = useHTTP();
  const { isAuthorized, accessToken } = useAuthorization();

  const headers: AxiosRequestHeaders = useMemo<AxiosRequestHeaders>(() => {
    const _headers: any = {};

    if (isAuthorized) {
      _headers["Authorization"] = `Bearer ${accessToken}`;
    }

    _headers["Access-Control-Allow-Origin"] = "*";
    _headers["Content-Type"] = "application/json";

    return _headers;
  }, [ isAuthorized, accessToken ]);

  return {
    authorization: {
      signUp: ({ email, fullname, debug, password, loader }) => {
        const body = {
          email: email,
          fullName: fullname,
          password: password,
        };
        return http.request<void>({
          method: "POST",
          url: `${API_URL}/users/sign-up`,
          headers,
          data: body,
          debug,
          loader: !!loader ? loader : "Processing sign up...",
        });
      },
      signIn: ({ loader, debug, password, email }) => {
        return http.request<{ accessToken: string, user: IUser }>({
          method: "POST",
          url: `${API_URL}/users/sign-in`,
          headers,
          data: {
            email,
            password,
          },
          loader: !!loader ? loader : "Processing sign in...",
          debug,
        });
      },
      signOut: ({ loader }) => {
        return http.request<void>({
          method: "POST",
          url: `${API_URL}/users/logout`,
          headers,
          loader: !!loader ? loader : "Processing sign out...",
        });

      },
    },
    account: {
      get: ({ loader }) => {
        return http.request<IUser>({
          method: "GET",
          url: `${API_URL}/users/me`,
          headers,
          loader: !!loader ? loader : "Loading users...",
        });
      },
    },
    auctions: {
      get: ({ params }) => {
        return http.request<{ items: IAuction[], page: number, pageSize: number, totalCount: number }>({
          method: "GET",
          url: `${API_URL}/auctions`,
          headers,
          params,
        });
      },
      one: ({ id }) => {
        return http.request<IAuction>({
          method: "GET",
          url: `${API_URL}/auctions/${id}`,
          headers,
        });
      },
      create: ({ auction }) => {
        return http.request<IAuction>({
          method: "POST",
          url: `${API_URL}/auctions`,
          headers,
          data: { ...auction },
        });
      },
    },
    message: {
      get: ({}) => {
        return http.request<IMessage[]>({
          method: "GET",
          url: `${API_URL}/messages`,
          headers,
          params: {
            limit: 100,
          },
        });
      },
      send: ({ auctionId, text }) => {
        return http.request<void>({
          method: "POST",
          url: `${API_URL}/messages`,
          headers,
          data: {
            auctionId,
            text,
          },
        });
      },
    },
    bids: {
      get: ({ lotId }) => {
        return http.request<{ items: IBid[], page: number, pageSize: number, totalCount: number }>({
          method: "GET",
          url: `${API_URL}/bids`,
          headers,
          params: {
            lotId,
            page: 1,
            pageSize: 100,
          },
        });
      },
      send: ({ lotId, price }) => {
        return http.request<void>({
          method: "POST",
          url: `${API_URL}/bids`,
          headers,
          data: {
            lotId,
            price,
          },
        });
      },
    },
  };
};
