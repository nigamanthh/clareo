# Dr. Neutron Video Generation Setup Guide

## 🎬 Video Feature Overview

The video generation feature creates AI avatar explanations of Dr. Neutron's responses using D-ID's API. This provides students with engaging, space-themed video content for better learning.

## 📋 Setup Instructions

### Step 1: Sign Up for D-ID

1. Go to [D-ID Studio](https://studio.d-id.com/)
2. Sign up for a free account
3. You'll get **20 free video credits per month** (perfect for prototyping!)

### Step 2: Get Your API Key

1. After signing in, go to the [API Keys page](https://studio.d-id.com/account/settings)
2. Create a new API key
3. Copy the API key (it will look like: `Basic xxxxxxxxxxxxxxxx`)

### Step 3: Add API Key to Your Project

1. Open the `.env` file in your project root
2. Replace `your_did_api_key_here` with your actual API key:
   ```
   DID_API_KEY=Basic_your_actual_api_key_here
   ```
3. Save the file

### Step 4: Restart the Server

```bash
npm run server
```

You should see: "Dr. Neutron Brain active on port 3000" (without the D-ID warning)

## 🚀 How to Use

1. Open the chatbot and ask Dr. Neutron a question
2. Wait for the response
3. Click the 🎬 icon in the chatbot header
4. Wait 20-30 seconds for the video to generate
5. Watch the AI avatar explain the concept!
6. Download the video if you want to keep it

## 💰 Pricing

- **Free Tier**: 20 videos/month
- **Paid Plans**: Start at $5.90/month for 100 videos
- **Cost per video**: ~$0.12-0.30 (20-60 seconds)

Perfect for prototyping! Upgrade when you need more.

## 🎨 Future Enhancements

Once better APIs are available (Veo 3, Sora), we can upgrade to:
- Custom space-themed avatars
- Animated backgrounds with planets and stars
- More natural AI voices
- Longer videos with better quality

## 🔧 Troubleshooting

**Issue**: "D-ID API key not configured" error
- **Solution**: Make sure you've added the API key to `.env` file correctly

**Issue**: Video generation times out
- **Solution**: D-ID servers might be busy. Try again in a few minutes.

**Issue**: "Failed to connect to video generation service"
- **Solution**: Make sure the backend server is running on port 3000

## 📚 Resources

- [D-ID Documentation](https://docs.d-id.com/)
- [D-ID API Reference](https://docs.d-id.com/reference/api-overview)
- [D-ID Pricing](https://www.d-id.com/pricing/)

---

**Note**: This is a prototype implementation. As better video generation APIs become available (like Google's Veo 3 or OpenAI's Sora), we'll upgrade the system while keeping the same user interface!
