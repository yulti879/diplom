<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CinemaHall;
use Illuminate\Http\Request;

class CinemaHallController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $halls = CinemaHall::all();
        return response()->json([
            'success' => true,
            'data' => $halls
        ]);
    }

    /**
     * Store a newly created resource.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rows' => 'required|integer|min:1|max:20',
            'seats_per_row' => 'required|integer|min:1|max:15',
            'layout' => 'nullable|array',
            'standard_price' => 'sometimes|integer|min:0',
            'vip_price' => 'sometimes|integer|min:0',
            'is_active' => 'boolean'
        ]);

        $hall = CinemaHall::create($validated);

        return response()->json([
            'success' => true,
            'data' => $hall,
            'message' => 'Cinema hall created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $hall = CinemaHall::find($id);
        
        if (!$hall) {
            return response()->json([
                'success' => false,
                'message' => 'Cinema hall not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $hall
        ]);
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, string $id)
    {
        $hall = CinemaHall::find($id);
        
        if (!$hall) {
            return response()->json([
                'success' => false,
                'message' => 'Cinema hall not found'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'rows' => 'sometimes|integer|min:1|max:20',
            'seats_per_row' => 'sometimes|integer|min:1|max:15',
            'layout' => 'nullable|array',
            'standard_price' => 'sometimes|integer|min:0', // ← ДОБАВИТЬ
            'vip_price' => 'sometimes|integer|min:0',     // ← ДОБАВИТЬ
            'is_active' => 'sometimes|boolean'
        ]);

        $hall->update($validated);

        return response()->json([
            'success' => true,
            'data' => $hall,
            'message' => 'Cinema hall updated successfully'
        ]);
    }

    /**
     * Remove the specified resource.
     */
    public function destroy(string $id)
    {
        $hall = CinemaHall::find($id);
        
        if (!$hall) {
            return response()->json([
                'success' => false,
                'message' => 'Cinema hall not found'
            ], 404);
        }

        $hall->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cinema hall deleted successfully'
        ]);
    }
}