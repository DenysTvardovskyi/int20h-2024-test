import { FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import i18n from "i18next";
import { Avatar, Button, Flex, Select, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useAuthorization } from "../../hooks";
import { UserOutlined } from "@ant-design/icons";

interface IProps {}

const LANGUAGES: any = {
  en: { nativeName: "En" },
  ua: { nativeName: "Ua" },
};

export const Header: FC<IProps> = (): JSX.Element => {
  const { t } = useTranslation();
  const { isAuthorized, user, resetAuthorization } = useAuthorization();
  const nav = useNavigate();

  const langOptions: { value: string, label: string }[] = Object.keys(LANGUAGES)
    .map((lng) => ({ value: lng, label: LANGUAGES[lng].nativeName }));

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  const handleLogout = () => {
    resetAuthorization();
    nav("/sign-in");
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
        <Link to="/">
          Home
        </Link>
        {isAuthorized && <Link to="/auctions/create">
          Create Auction
        </Link>}
        {!isAuthorized ? <Flex gap="small">
          <Link to="/sign-in">
            {t("header.navigation.signIn")}
          </Link>
          <Link to="/sign-up">
            {t("header.navigation.signUp")}
          </Link>
        </Flex> : <Flex>
          <Space wrap size={16}>
            {!user.avatar ? <Avatar size="large" icon={<UserOutlined />} /> :
              <Avatar size="large" src={user.avatar}></Avatar>}
            <Typography>{user.fullName}</Typography>
          </Space>
        </Flex>}
        <Select
          defaultValue={i18n.resolvedLanguage}
          style={{ width: 120 }}
          onChange={handleChange}
          options={langOptions}
        />
        {isAuthorized && <Button onClick={handleLogout}>Log out</Button>}
      </div>
    </>
  );
};
