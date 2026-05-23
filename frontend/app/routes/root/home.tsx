import React from "react";
import type { Route } from "../../+types/root";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Users, CheckSquare, BarChart3 } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TaskNova" },
    { name: "description", content: "Welcome to TaskNova!" },
  ];
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
};

const Homepage = () => {
  return (
    <div className="w-full min-h-screen flex flex-col">

      {/* TOP TITLE */}
    
      {/* HERO */}
      <section className="bg-blue-600 text-white py-24 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="max-w-3xl mx-auto px-4"
        >
            <h1 className="text-6xl font-bold mb-4">
            TaskNova
          </h1>

          <h1 className="text-5xl font-bold mb-4">
            Ready to boost your team's productivity?
          </h1>
          <p className="text-white/80 mb-6">
            Join thousands of teams that use TaskNova to get more done, together.
          </p>

         <div className="flex justify-center gap-4">
  <Link to="/sign-up">
    <motion.div whileHover={{ scale: 1.05 }}>
      <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-2 rounded-full">
        Get Started Free
      </Button>
    </motion.div>
  </Link>

  <Link to="/sign-in">
    <motion.div whileHover={{ scale: 1.05 }}>
      <Button className="bg-transparent border border-white text-white hover:bg-white hover:text-blue-600 px-6 py-2 rounded-full">
        Sign In
      </Button>
    </motion.div>
  </Link>
</div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-gray-50 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto px-4"
        >
          <h2 className="text-4xl font-bold mb-12">
            Simple process, powerful results
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {["Create an account", "Invite your team", "Get things done"].map(
              (item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <div className="text-6xl text-gray-200 mb-4">{i + 1}</div>
                  <h3 className="font-bold text-lg">{item}</h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Get started quickly and collaborate efficiently.
                  </p>
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="py-20 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto px-4"
        >
          <h2 className="text-4xl font-bold mb-4">
            Everything you need to manage tasks
          </h2>
          <p className="text-gray-500 mb-12">
            Powerful features to boost productivity
          </p>

          <div className="grid md:grid-cols-3 gap-10">

            {/* Team Collaboration */}
            <motion.div variants={fadeUp} whileHover={{ y: -5 }} className="p-6 border rounded-xl">
              <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-full mx-auto mb-4">
                <Users className="text-blue-600" size={22} />
              </div>
              <h3 className="font-bold">Team Collaboration</h3>
              <p className="text-gray-500 text-sm mt-2">
                Seamless and efficient workflow for teams.
              </p>
            </motion.div>

            {/* Task Management */}
            <motion.div variants={fadeUp} whileHover={{ y: -5 }} className="p-6 border rounded-xl">
              <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-full mx-auto mb-4">
                <CheckSquare className="text-blue-600" size={22} />
              </div>
              <h3 className="font-bold">Task Management</h3>
              <p className="text-gray-500 text-sm mt-2">
                Organize and track tasks efficiently.
              </p>
            </motion.div>

            {/* Progress Tracking */}
            <motion.div variants={fadeUp} whileHover={{ y: -5 }} className="p-6 border rounded-xl">
              <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-full mx-auto mb-4">
                <BarChart3 className="text-blue-600" size={22} />
              </div>
              <h3 className="font-bold">Progress Tracking</h3>
              <p className="text-gray-500 text-sm mt-2">
                Visualize progress with insights and analytics.
              </p>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-blue-600 text-white py-20 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-4">
            Get more done with TaskNova
          </h2>

          <div className="flex justify-center gap-4">
             <Link to="/sign-up">
    <motion.div whileHover={{ scale: 1.05 }}>
      <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-2 rounded-full">
        Try for Free
      </Button>
    </motion.div>
  </Link>

  <Link to="/sign-in">
    <motion.div whileHover={{ scale: 1.05 }}>
      <Button className="bg-transparent border border-white text-white hover:bg-white hover:text-blue-600 px-6 py-2 rounded-full">
        Logg In
      </Button>
    </motion.div>
  </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default Homepage;