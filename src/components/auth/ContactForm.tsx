"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { sendContactMessage } from "@/service/contactus";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast"; // ✅ import toast

export default function ContactForm() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast(); // ✅ hook for toast

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await sendContactMessage(data);

      toast({
        title: "✅ Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });

      reset(); // clear form
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: err.error || "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input {...register("name")} placeholder="Your Name" required />
      <Input type="email" {...register("email")} placeholder="Your Email" required />
      <Textarea {...register("message")} placeholder="Your Message" required />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
