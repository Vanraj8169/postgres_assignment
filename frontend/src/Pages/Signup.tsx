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
import { Link, useNavigate } from "react-router-dom";
import { Label } from "../components/ui/label";
import { FormEvent, useState } from "react";
import axios from "axios";

const Signup = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/signup", {
        username,
        email,
        password,
      });
      localStorage.setItem("token", res.data);
      navigate("/home");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An Unknown error occured");
      }
    }
  };
  return (
    <div className="h-screen flex justify-center items-center">
      <Card className="w-[350px] ">
        <CardHeader>
          <CardTitle className="font-bold text-2xl">Signup</CardTitle>
          <CardDescription>
            Create an account ?{" "}
            <Link to={"/login"} className="underline">
              Login
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Username</Label>
                <Input
                  id="name"
                  placeholder="Enter your username"
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </form>
          {error && <div className="text-red-600">{error}</div>}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button onClick={handleSubmit}>Register</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
