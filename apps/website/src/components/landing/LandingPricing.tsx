"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, AlertCircle } from 'lucide-react';
import { useCountry } from '@/hooks/useCountry';
import { Button } from '@/components/ui/button';

export default function LandingPricing({ onSignup }: { onSignup?: () => void }) {
    const { country, loading } = useCountry();
    const isIN = country === 'IN';

    const currencySymbol = isIN ? '₹' : '$';
    
    const pricing = {
        free: {
            name: 'Free',
            price: '0',
            originalPrice: null,
            description: 'Essential tools to get you started.',
            features: [
                '15 Life Time Free Credits',
                'Fill up to 10 Long Forms',
                'Fill up to 20 Medium Forms',
                'Secure Cloud Storage',
                'Basic AI Extraction'
            ],
            cta: 'Get Started Free',
            highlighted: false
        },
        plus: {
            name: 'Plus',
            price: isIN ? '199' : '2',
            originalPrice: isIN ? '500' : '5',
            discount: '60% OFF',
            description: 'Powerful features for professionals.',
            features: [
                '60 Credits Included',
                'Fill up to 40 Long Forms',
                'Fill up to 80 Medium Forms',
                'Advanced AI Extraction',
                'Priority 24/7 Support',
                '1-Click Complex Autofill'
            ],
            cta: 'Upgrade to Plus',
            highlighted: true
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 20
            }
        }
    };

    return (
        <div className="pt-6 pb-20 bg-[#fafbff] relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-blue-100/40 blur-[120px] animate-pulse" />
            <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-indigo-100/30 blur-[100px]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full bg-white shadow-sm border border-blue-100 text-[#2F56C0] text-sm font-bold"
                    >
                        <Sparkles className="w-4 h-4 fill-[#2F56C0]/20" />
                        <span>Investment-grade productivity</span>
                    </motion.div>
                    
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]"
                    >
                        Save hours of work <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F56C0] via-[#4A80F0] to-[#1e3a8a]">
                            for the price of a coffee.
                        </span>
                    </motion.h2>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-lg text-slate-600 leading-relaxed font-medium"
                    >
                        Join thousands of users automating their applications with SabApplier AI. Secure, fast, and remarkably simple.
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto items-center"
                >
                    {/* Free Tier */}
                    <motion.div 
                        variants={itemVariants}
                        whileHover={{ y: -8 }}
                        className="bg-white rounded-[40px] p-8 border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(47,86,192,0.08)] transition-all duration-500 relative flex flex-col h-full"
                    >
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{pricing.free.name}</h3>
                            <p className="text-slate-500 font-medium text-sm mb-6">{pricing.free.description}</p>
                            
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-slate-400">{currencySymbol}</span>
                                <span className="text-6xl font-black text-slate-900 tracking-tighter">{pricing.free.price}</span>
                                <span className="text-base text-slate-500 font-bold ml-1 uppercase tracking-wider">Lifetime</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 flex-grow">
                            {pricing.free.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-[#2F56C0] flex items-center justify-center transition-colors group-hover:bg-[#2F56C0] group-hover:text-white">
                                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-700 font-semibold text-[15px]">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button 
                            onClick={onSignup} 
                            variant="outline" 
                            className="w-full py-7 text-lg font-extrabold rounded-2xl border-2 border-slate-100 hover:border-[#2F56C0] hover:bg-white hover:text-[#2F56C0] text-slate-800 transition-all duration-300 shadow-sm"
                        >
                            {pricing.free.cta}
                        </Button>
                    </motion.div>

                    {/* Plus Tier - Premium */}
                    <motion.div 
                        variants={itemVariants}
                        whileHover={{ y: -8 }}
                        className="bg-slate-900 rounded-[40px] p-8 shadow-[0_30px_100px_rgba(30,58,138,0.2)] relative flex flex-col h-full overflow-hidden border border-white/10"
                    >
                        {/* Premium Glow Overlay */}
                        <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#2F56C0]/30 blur-[80px] rounded-full pointer-events-none" />
                        
                        <div className="absolute top-6 right-6">
                            <motion.div 
                                animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="bg-gradient-to-br from-[#FF9B42] via-[#FF4D4D] to-[#E63946] text-white text-[12px] font-black px-4 py-2 rounded-full shadow-[0_8px_20px_rgba(230,57,70,0.4)] border border-white/30 flex items-center gap-2 uppercase tracking-widest"
                            >
                                <Sparkles className="w-3 h-3 fill-white/50" />
                                {pricing.plus.discount}
                            </motion.div>
                        </div>

                        <div className="mb-6 relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-bold text-white">{pricing.plus.name}</h3>
                                <div className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] uppercase font-black tracking-tighter">Recommended</div>
                            </div>
                            <p className="text-slate-400 font-medium text-sm mb-6">{pricing.plus.description}</p>
                            
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-blue-400">{currencySymbol}</span>
                                <span className="text-6xl font-black text-white tracking-tighter">{pricing.plus.price}</span>
                                <span className="text-base text-slate-400 font-bold ml-1 uppercase tracking-wider">/month</span>
                            </div>
                            {pricing.plus.originalPrice && (
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-slate-500 line-through font-bold">{currencySymbol}{pricing.plus.originalPrice}</span>
                                    <span className="text-[#4BD37B] text-sm font-black italic">Saving {isIN ? '₹301' : '$3'} monthly</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 mb-8 flex-grow relative z-10">
                            {pricing.plus.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-blue-400 flex items-center justify-center transition-all group-hover:bg-blue-500 group-hover:text-white">
                                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-200 font-semibold text-[15px]">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button 
                            onClick={onSignup} 
                            className="w-full py-7 text-lg font-extrabold rounded-2xl bg-[#2F56C0] hover:bg-blue-600 text-white transition-all duration-300 shadow-[0_10px_30px_rgba(47,86,192,0.3)] relative z-10 border border-white/10"
                        >
                            {pricing.plus.cta}
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Trust Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 flex flex-col items-center gap-6"
                >
                    <div className="flex items-center gap-4 text-slate-400 bg-white/50 border border-slate-100 py-3 px-8 rounded-full shadow-sm backdrop-blur-md">
                        <AlertCircle className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-bold uppercase tracking-wide">14-Day Money Back Guarantee • Secure Payment</span>
                    </div>
                    
                    <p className="text-slate-400 text-xs font-medium italic select-none">
                        All transactions are encrypted and processed through industry-standard providers.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
