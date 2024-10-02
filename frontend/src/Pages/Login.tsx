import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { Label } from "../components/ui/label";

const Login = () => {
  return (
    <div className="h-screen flex justify-center items-center">
      <Card className="w-[350px] ">
        <CardHeader>
          <CardTitle className="font-bold text-2xl">Signin</CardTitle>
          <CardDescription>
            Create an account ?{" "}
            <Link to={"/"} className="underline">
              Register
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Username</Label>
                <Input id="name" placeholder="Enter your username" />
                <Label htmlFor="password">Password</Label>
                <Input id="password" placeholder="Enter your password" />
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button>login</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
