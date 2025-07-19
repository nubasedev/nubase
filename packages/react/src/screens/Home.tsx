import type { FC } from "react";
import { Button } from "../components";

export type HomeScreenProps = {};

const HomeScreen: FC<HomeScreenProps> = (props) => {
  return (
    <div>
      <Button variant="default">Click me</Button>
    </div>
  );
};

export default HomeScreen;
