"use client";
 
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { login as loginApi } from '@/service/auth';
import { register as registerApi } from '@/service/auth';
import { useRouter } from "next/navigation";
 
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Role } from "@/types";
import { MountainSnow } from "lucide-react";

import { registerToWordPress } from '../../../src/api/wordpress'
 
const formSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["USER", "SUPER_ADMIN"], { required_error: "You need to select a role." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
 
export default function RegisterForm() {
  const { toast } = useToast();
const router = useRouter();
 
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "USER",
    },
  });
 
 const onSubmit = async (values: z.infer<typeof formSchema>) => {
  try {
 
    const res = await registerApi({
      username:values.username,
      email: values.email,
      password: values.password,
      role: values.role,
    });
 
    await registerToWordPress({
      username: values.username,
      email: values.email,
      password: values.password,
    });
 
 
    toast({
      title: 'Registration Successful',
      description: 'Welcome to LiDAR Explorer!',
    });
 
     router.push('/login');
  } catch (error: any) {
    toast({
      variant: 'destructive',
      title: 'Registration Failed',
      description: error.response?.data?.message || 'An unexpected error occurred.',
    });
  }
};
 
 
 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <MountainSnow className="h-16 w-16 text-primary mb-3" />
          <h2 className="text-3xl font-headline font-bold text-center text-foreground">Create Account</h2>
          <p className="text-muted-foreground text-center mt-1">Join LiDAR Explorer today.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="abc123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Register as</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="USER" />
                        </FormControl>
                        <FormLabel className="font-normal">End User</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="SUPER_ADMIN" />
                        </FormControl>
                        <FormLabel className="font-normal">Super Admin</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6">
              Register
            </Button>
          </form>
        </Form>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" asChild className="text-accent p-0 h-auto font-semibold hover:text-accent/80">
            <Link href="/login">
              Log in here
            </Link>
          </Button>
        </p>
      </div>
    </div>
  );
}
 
 