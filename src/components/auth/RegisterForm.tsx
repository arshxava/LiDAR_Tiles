"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { login as loginApi } from '@/service/auth';
import { register as registerApi } from '@/service/auth';
import { useRouter } from "next/navigation";
import { useState } from "react";
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
const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);

    const res = await registerApi({
      username: values.username,
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
  } finally {
    setIsLoading(false);
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
           <Button
  type="submit"
  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
  disabled={isLoading}
>
  {isLoading ? "Registering..." : "Register"}
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

// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { register as registerApi } from '@/service/auth';
// import { useRouter } from "next/navigation";

// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { useToast } from "@/hooks/use-toast";
// import { MountainSnow } from "lucide-react";

// import { registerToWordPress } from '../../../src/api/wordpress';

// const formSchema = z.object({
//   firstName: z.string().min(1, { message: "First name is required." }),
//   lastName: z.string().min(1, { message: "Last name is required." }),
//   username: z.string().min(3, { message: "Username must be at least 3 characters." }),
//   email: z.string().email({ message: "Invalid email address." }),
//   password: z.string().min(6, { message: "Password must be at least 6 characters." }),
//   confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
//   sex: z.enum(["Male", "Female", "Other"], { required_error: "Select a sex." }),
//   age: z.coerce.number().min(1, { message: "Age must be greater than 0." }),
//   education: z.string().min(1, { message: "Education is required." }),
//   province: z.string().min(1, { message: "Province is required." }),
//   country: z.string().min(1, { message: "Country is required." }),
// profilePicture: z.any().refine(file => file instanceof File, {
//   message: "Profile picture is required.",
// }),
//   role: z.enum(["USER", "SUPER_ADMIN"], { required_error: "You need to select a role." }),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// });

// export default function RegisterForm() {
//   const { toast } = useToast();
//   const router = useRouter();

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       firstName: "",
//       lastName: "",
//       username: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//       sex: "Male",
//       age: 18,
//       education: "",
//       province: "",
//       country: "",
//       role: "USER",
//     },
//   });
// const onSubmit = async (values: z.infer<typeof formSchema>) => {
//   try {
//     const formData = new FormData();

//     // Append all fields
//     formData.append("firstName", values.firstName);
//     formData.append("lastName", values.lastName);
//     formData.append("username", values.username);
//     formData.append("email", values.email);
//     formData.append("password", values.password);
//     formData.append("confirmPassword", values.confirmPassword);
//     formData.append("sex", values.sex);
//     formData.append("age", values.age.toString());
//     formData.append("education", values.education);
//     formData.append("province", values.province);
//     formData.append("country", values.country);
//     formData.append("role", values.role);
//     formData.append("profilePic", values.profilePicture); // 👈 must match `.single("profilePic")` in backend

//     await registerApi(formData);

//     toast({
//       title: 'Registration Successful',
//       description: 'Welcome to LiDAR Explorer!',
//     });

//     router.push('/login');
//   } catch (error: any) {
//     toast({
//       variant: 'destructive',
//       title: 'Registration Failed',
//       description: error.response?.data?.message || 'An unexpected error occurred.',
//     });
//   }
// };

//   // const onSubmit = async (values: z.infer<typeof formSchema>) => {
//   //   try {
//   //     await registerApi(values);

//   //     await registerToWordPress({
//   //       username: values.username,
//   //       email: values.email,
//   //       password: values.password,
//   //     });

//   //     toast({
//   //       title: 'Registration Successful',
//   //       description: 'Welcome to LiDAR Explorer!',
//   //     });

//   //     router.push('/login');
//   //   } catch (error: any) {
//   //     toast({
//   //       variant: 'destructive',
//   //       title: 'Registration Failed',
//   //       description: error.response?.data?.message || 'An unexpected error occurred.',
//   //     });
//   //   }
//   // };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
//       <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-2xl">
//         <div className="flex flex-col items-center mb-8">
//           <MountainSnow className="h-16 w-16 text-primary mb-3" />
//           <h2 className="text-3xl font-headline font-bold text-center text-foreground">Create Account</h2>
//           <p className="text-muted-foreground text-center mt-1">Join LiDAR Explorer today.</p>
//         </div>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

//             {/* First & Last Name in one row */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="firstName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>First Name</FormLabel>
//                     <FormControl>
//                       <Input placeholder="John" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="lastName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Last Name</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Doe" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
// <FormField
//   control={form.control}
//   name="profilePicture"
//   render={({ field }) => (
//     <FormItem>
//       <FormLabel>Profile Picture</FormLabel>
//       <FormControl>
//         <Input
//   type="file"
//   accept="image/*"
//   required
//   onChange={(e) => field.onChange(e.target.files?.[0])}
// />

//       </FormControl>
//       <FormMessage />
//     </FormItem>
//   )}
// />

//             <FormField
//               control={form.control}
//               name="username"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Username</FormLabel>
//                   <FormControl>
//                     <Input placeholder="abc123" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <Input placeholder="your@email.com" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="sex"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Sex</FormLabel>
//                   <FormControl>
//                     <RadioGroup
//                       value={field.value}
//                       onValueChange={field.onChange}
//                       className="flex gap-4"
//                     >
//                       <FormItem>
//                         <FormControl>
//                           <RadioGroupItem value="Male" id="sex-male" />
//                         </FormControl>
//                         <FormLabel htmlFor="sex-male">Male</FormLabel>
//                       </FormItem>
//                       <FormItem>
//                         <FormControl>
//                           <RadioGroupItem value="Female" id="sex-female" />
//                         </FormControl>
//                         <FormLabel htmlFor="sex-female">Female</FormLabel>
//                       </FormItem>
//                       <FormItem>
//                         <FormControl>
//                           <RadioGroupItem value="Other" id="sex-other" />
//                         </FormControl>
//                         <FormLabel htmlFor="sex-other">Other</FormLabel>
//                       </FormItem>
//                     </RadioGroup>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="age"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Age</FormLabel>
//                   <FormControl>
//                     <Input type="number" min={1} {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="education"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Education</FormLabel>
//                   <FormControl>
//                     <Input placeholder="e.g. Bachelor's in Computer Science" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Province & Country in one row */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="province"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Province</FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g. Ontario" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="country"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Country</FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g. Canada" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* Password & Confirm Password in one row */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Password</FormLabel>
//                     <FormControl>
//                       <Input type="password" placeholder="••••••••" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="confirmPassword"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Confirm Password</FormLabel>
//                     <FormControl>
//                       <Input type="password" placeholder="••••••••" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6">
//               Register
//             </Button>
//           </form>
//         </Form>

//         <p className="mt-8 text-center text-sm text-muted-foreground">
//           Already have an account?{" "}
//           <Button variant="link" asChild className="text-accent p-0 h-auto font-semibold hover:text-accent/80">
//             <Link href="/login">Log in here</Link>
//           </Button>
//         </p>
//       </div>
//     </div>
//   );
// }
