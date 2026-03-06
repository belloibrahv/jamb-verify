"use client";

import { motion } from "framer-motion";
import { Shield, CheckCircle2, Building2, FileCheck } from "lucide-react";

const partners = [
  {
    name: "JAMB",
    fullName: "Joint Admissions and Matriculation Board",
    description: "Official UTME registration authority",
    icon: Building2,
    color: "text-green-600"
  },
  {
    name: "NIMC",
    fullName: "National Identity Management Commission",
    description: "National identity verification provider",
    icon: Shield,
    color: "text-blue-600"
  }
];

const features = [
  {
    icon: CheckCircle2,
    title: "JAMB-Compliant",
    description: "Verification documents accepted for UTME registration"
  },
  {
    icon: FileCheck,
    title: "NIMC-Verified",
    description: "Direct integration with official NIN database"
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    description: "Government-approved verification process"
  }
];

export function PartnersSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <Shield className="h-4 w-4" />
            <span>Trusted & Compliant</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">
            Powered by Official Sources
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our verification service integrates directly with government-approved databases
            to ensure authenticity and compliance
          </p>
        </motion.div>

        {/* Partner Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-muted ${partner.color}`}>
                  <partner.icon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-2xl font-bold mb-1">
                    {partner.name}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {partner.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {partner.description}
                  </p>
                </div>
              </div>
              
              {/* Decorative element */}
              <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-2xl group-hover:scale-150 transition-transform" />
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="text-center space-y-3"
            >
              <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h4 className="font-semibold">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Compliance Notice */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <div className="rounded-xl border border-border/60 bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Official Compliance:</span> All NIN verifications
              are performed through authorized channels and generate verification documents that meet JAMB requirements
              for UTME registration. Our service is designed to streamline the verification process while
              maintaining full compliance with NIMC and JAMB guidelines.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
