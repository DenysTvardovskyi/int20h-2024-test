import React, { FC } from "react";
import { classes } from "../../utils";
import styles from "./System.module.scss";
import { Header } from "../../components";

interface IProps {
  children?: React.ReactNode | React.ReactNode[];
  main?: {
    className?: string;
  };
}

export const System: FC<IProps> = ({ main, children }: IProps): JSX.Element => {
  return (
    <div className={classes("d-flex", styles.container)}>
      <div className={styles.dashboard}>
        <Header />
        <main className={classes("d-flex py-3", styles.main, main?.className)}>
          {children}
        </main>
      </div>
    </div>
  );
};
