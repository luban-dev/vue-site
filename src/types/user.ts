export interface IToken {
  accessToken?: string;
  refreshToken?: string;
  expireIn: number;
}

export interface UserInfo {
  id: string;
  nickname: string | null;
}
