"use client";
 
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MountainSnow } from "lucide-react";
import { login as loginApi } from '@/service/auth';
 
//  Login schema without role
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
 
export default function LoginForm() {
  const { login, setUser, setToken } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
 
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
 
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
   
    try {
      const res = await loginApi({
        email: values.email,
        password: values.password,
      });
// console.log("Logged in user:", res.user.username); // ✅ Should log "rohanxava"
 
      setUser(res.user);
      setToken(res.token);
      toast({
        title: 'Login Successful',
        description: 'Welcome back to LiDAR Explorer!',
      });
 
      if (res.user.role === "SUPER_ADMIN") {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
 
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.response?.data?.msg || 'An unexpected error occurred.',
      });
    }
  };
 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <MountainSnow className="h-16 w-16 text-primary mb-3" />
          <h2 className="text-3xl font-headline font-bold text-center text-foreground">Welcome Back!</h2>
          <p className="text-muted-foreground text-center mt-1">Log in to explore LiDAR data.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6">
              Log In
            </Button>
          </form>
        </Form>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button variant="link" asChild className="text-accent p-0 h-auto font-semibold hover:text-accent/80">
            <Link href="/register">Register here</Link>
          </Button>
        </p>
      </div>
    </div>
  );
}
 
 