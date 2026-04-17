<?php

namespace App\Http\Controllers;

use App\Models\CustomerAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CustomerAttachmentController extends Controller
{
    /**
     * Display the attachments form.
     */
    public function index()
    {
        $user = Auth::user();
        $attachments = $user->attachments;
        
        return Inertia::render('Applicant/Attachments', [
            'attachments' => $attachments
        ]);
    }

    /**
     * Store a new attachment.
     */
    public function store(Request $request)
    {
        $request->validate([
            'attachment_type' => 'required|in:Resume/CV,Valid ID,Proof of Income,Proof of Address,Business Documents,other',
            'attachment' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240', // 10MB max
        ]);

        $user = Auth::user();
        
        // Store the file
        $file = $request->file('attachment');
        $path = $file->store('attachments/' . $user->id, 'public');
        
        // Create attachment record
        $attachment = $user->attachments()->create([
            'attachment_type' => $request->attachment_type,
            'attachment_path' => $path,
        ]);

        return redirect()->back()->with('success', 'Attachment uploaded successfully!');
    }

    /**
     * Delete an attachment.
     */
    public function destroy(CustomerAttachment $attachment)
    {
        // Check if user owns this attachment
        if ($attachment->user_id !== Auth::id()) {
            abort(403);
        }

        // Delete the file
        Storage::disk('public')->delete($attachment->attachment_path);
        
        // Delete the record
        $attachment->delete();

        return redirect()->back()->with('success', 'Attachment deleted successfully!');
    }
}
