<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function store(Request $request, User $user)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $user->id,
            'message' => $request->message,
        ]);

        return redirect()->back();
    }

    public function index(Request $request, User $user)
{
    $authUser = $request->user();

    $messages = Message::where(function ($query) use ($authUser, $user) {
            $query->where('sender_id', $authUser->id)
                  ->where('receiver_id', $user->id);
        })
        ->orWhere(function ($query) use ($authUser, $user) {
            $query->where('sender_id', $user->id)
                  ->where('receiver_id', $authUser->id);
        })
        ->orderBy('created_at')
        ->get();

    return Inertia::render('Chat/Chat-page', [
        'messages' => $messages,
        'auth' => ['user' => $authUser],
        'otherUser' => [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
        ],
    ]);
}
public function viewChats()
{
    $authUser = Auth::user();

    $messages = Message::where('sender_id', $authUser->id)
        ->orWhere('receiver_id', $authUser->id)
        ->orderBy('created_at', 'desc')
        ->get();

    $chats = collect();
    foreach ($messages as $msg) {
        $otherUserId = $msg->sender_id === $authUser->id ? $msg->receiver_id : $msg->sender_id;

        if ($chats->contains('userId', $otherUserId)) continue;

        $otherUser = User::find($otherUserId);

        $chats->push([
            'userId' => $otherUser->id,
            'email' => $otherUser->email,
            'first_name' => $otherUser->first_name,
            'last_name' => $otherUser->last_name,
            'lastMessage' => $msg->message,
            'lastMessageAt' => $msg->created_at,
        ]);
    }

    return Inertia::render('Chat/Chat-list', [
        'chats' => $chats->values(),
    ]);
}
}
