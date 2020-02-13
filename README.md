# Word Replace
We're using this to replace some special characters to emoji. That means you can use classical Yahoo emoticons now!

### Installation
- Go to Rocket Administration > General > Apps > Enable development mode
- Follow the steps:
```
git clone git@github.com:JuzSer/rocket.chat-word-replace.git

cd rocket.chat-word-replace

rc-apps deploy --url your_chat_url --username admin_username --password admin_password
```

Done!
Checkout your Rocket.Chat App Listing.

### Example

```
[
{"source": ":|", "replacement": ":neutral_face:"},
{"source": "=))", "replacement": ":zany_face:"},
]
```

`:|` will become 😐


Have fun! 

### Note
- This only replaces on message sent, not on message modified.
- It will not replace if the source is using inside triple backticks ` ``` `

---

Inspired by https://github.com/vynmera/Rocket.Chat.WordFilter
