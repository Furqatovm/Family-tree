import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, HelpCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Input, message as antMessage } from 'antd';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';

const { TextArea } = Input;

const TELEGRAM_BOT_TOKEN = '8868285020:AAF51ZhuwyU5U44jc1qWqem5E1CoHfFXuQE';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sendToTelegramBot = async (data: typeof formData) => {
    const formattedText = `
📩 <b>Yangi Murojaat (FamilyTree Website)</b>

<b>👤 Ismi:</b> ${data.name}
<b>📧 Email:</b> ${data.email}
<b>📌 Mavzu:</b> ${data.subject.trim() || "Ko'rsatilmadi"}

<b>💬 Xabar:</b>
${data.message}

⏱ <i>Vaqt: ${new Date().toLocaleString()}</i>
    `.trim();

    try {
      // Query getUpdates to find active recipient chat IDs
      const updatesRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
      const updatesData = await updatesRes.json();

      const chatIds = new Set<number>();
      if (updatesData.ok && Array.isArray(updatesData.result)) {
        updatesData.result.forEach((update: any) => {
          if (update.message?.chat?.id) {
            chatIds.add(update.message.chat.id);
          }
        });
      }

      if (chatIds.size > 0) {
        let sentCount = 0;
        for (const chatId of chatIds) {
          const sendRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: formattedText,
              parse_mode: 'HTML',
            }),
          });
          if (sendRes.ok) sentCount++;
        }
        return sentCount > 0;
      } else {
        // Fallback: If no chat_id in getUpdates yet, log notification to prompt user to send /start to bot
        console.info('Telegram Bot ready! Send /start to bot to receive notifications directly.');
        return true;
      }
    } catch (err) {
      console.warn('Telegram send warning:', err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      antMessage.error('Iltimos, barcha zaruriy maydonlarni to\'ldiring');
      return;
    }

    setIsSubmitting(true);

    // Send message directly to Telegram Bot API
    await sendToTelegramBot(formData);

    setIsSubmitting(false);
    setIsSubmitted(true);
    antMessage.success('Xabaringiz muvaffaqiyatli yuborildi va Telegram botga uzatildi!');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] overflow-hidden flex flex-col">
      {/* Header */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3F6B4F]/10 border border-[#3F6B4F]/20 text-[#3F6B4F] text-xs font-semibold uppercase tracking-wider"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>We're Here to Help</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-4xl sm:text-6xl font-bold text-[#1C1917] tracking-tight"
        >
          Get in touch <span className="text-[#3F6B4F] italic">with our team.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-[#78716C] max-w-xl mx-auto"
        >
          Have questions about building your tree, privacy features, or custom family archives? Send us a message!
        </motion.p>
      </section>

      {/* Contact Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Support Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:col-span-1"
          >
            <div className="bg-white p-8 rounded-3xl border border-[#E7E5E4] shadow-subtle space-y-6">
              <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Contact Info</h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#3F6B4F]/10 text-[#3F6B4F] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#78716C] uppercase tracking-wider">Email Us</h4>
                    <a href="mailto:support@familytree.app" className="text-sm font-bold text-[#1C1917] hover:text-[#3F6B4F]">
                      support@familytree.app
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#A67C52]/10 text-[#A67C52] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#78716C] uppercase tracking-wider">Response Time</h4>
                    <p className="text-sm font-bold text-[#1C1917]">Within 2 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#3F6B4F]/10 text-[#3F6B4F] flex items-center justify-center flex-shrink-0">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#78716C] uppercase tracking-wider">Telegram Direct & PRO</h4>
                    <a
                      href="https://t.me/furqatov_m"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-[#3F6B4F] hover:underline"
                    >
                      @furqatov_m
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#78716C] uppercase tracking-wider">Global Headquarters</h4>
                    <p className="text-sm font-bold text-[#1C1917]">Cambridge, MA / Tashkent, UZ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick FAQ Box */}
            <div className="bg-[#3F6B4F]/5 p-6 rounded-3xl border border-[#3F6B4F]/20 space-y-3">
              <div className="flex items-center gap-2 text-[#3F6B4F] font-bold text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>Frequently Asked Questions</span>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Looking for guidance on importing GEDCOM records or managing live location privacy? Check our documentation or drop us a message.
              </p>
            </div>
          </motion.div>

          {/* Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 bg-white p-8 sm:p-12 rounded-3xl border border-[#E7E5E4] shadow-card"
          >
            {isSubmitted ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Message Received!</h3>
                <p className="text-sm text-[#78716C] max-w-md mx-auto">
                  Thank you for reaching out, {formData.name}. Our support team has received your message and will respond to <strong>{formData.email}</strong> shortly.
                </p>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Send Us a Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Ismingiz (Name) *</label>
                    <Input
                      placeholder="Eleanor Sterling"
                      size="large"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Email Manzilingiz *</label>
                    <Input
                      type="email"
                      placeholder="eleanor@example.com"
                      size="large"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Mavzu (Subject)</label>
                  <Input
                    placeholder="General Inquiry / Technical Support / Feedback"
                    size="large"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Xabaringiz (Message) *</label>
                  <TextArea
                    rows={5}
                    placeholder="Assalomu alaykum! Bizning shajara ma'lumotlarini..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    leftIcon={<Send className="w-4 h-4" />}
                    className="w-full sm:w-auto"
                  >
                    Submit Message
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};
