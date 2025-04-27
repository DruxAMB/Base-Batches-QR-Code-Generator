import React, { useState } from 'react';
import { z } from 'zod';
// @ts-expect-error qrcode.react default import (no types)
import QRCode from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof formSchema>;

export default function QrForm() {
  const [form, setForm] = useState<FormData>({ name: '', email: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [qrValue, setQrValue] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = formSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string } = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as 'name' | 'email'] = err.message;
      });
      setErrors(fieldErrors);
      setQrValue(null);
      return;
    }
    setErrors({});
    setQrValue(JSON.stringify(form));
  }

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="flex flex-col gap-4 max-w-sm mx-auto bg-white p-6 rounded-lg shadow-md"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } }
      }}
    >
      <motion.label 
        className="flex flex-col"
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      >
        <span className="mb-1 text-sm font-medium text-gray-700">Name</span>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name}</span>}
      </motion.label>
      <motion.label 
        className="flex flex-col"
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      >
        <span className="mb-1 text-sm font-medium text-gray-700">Email</span>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email}</span>}
      </motion.label>
      <motion.button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
      >
        Generate QR Code
      </motion.button>
      <AnimatePresence>
        {qrValue && (
          <motion.div
            key="qr"
            className="flex flex-col items-center mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <QRCode
              id="qr-canvas"
              value={qrValue}
              size={160}
              bgColor="#fff"
              fgColor="#0052ff"
              includeMargin={true}
              renderAs="canvas"
            />
            <span className="mt-2 text-xs text-gray-500">{qrValue}</span>
            <button
              type="button"
              onClick={() => {
                const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement | null;
                if (canvas) {
                  const url = canvas.toDataURL('image/png');
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `qr-code.png`;
                  a.click();
                }
              }}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition-colors"
            >
              Download QR Code
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
