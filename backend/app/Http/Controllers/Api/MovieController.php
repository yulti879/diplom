<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MovieController extends Controller
{
    public function index()
    {
        $movies = Movie::all();
        return response()->json([
            'success' => true,
            'data' => $movies
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'poster_url' => 'nullable|string', // ← ДОБАВИТЬ
            'synopsis' => 'required|string',
            'duration' => 'required|integer|min:1',
            'origin' => 'required|string|max:255',
        ]);

        $movie = Movie::create($validated);

        return response()->json([
            'success' => true,
            'data' => $movie,
            'message' => 'Movie created successfully'
        ], 201);
    }

    public function show(string $id)
    {
        $movie = Movie::find($id);

        if (!$movie) {
            return response()->json([
                'success' => false,
                'message' => 'Movie not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $movie
        ]);
    }

    public function update(Request $request, string $id)
    {
        $movie = Movie::find($id);

        if (!$movie) {
            return response()->json([
                'success' => false,
                'message' => 'Movie not found'
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'poster_url' => 'nullable|url',
            'synopsis' => 'sometimes|string',
            'duration' => 'sometimes|integer|min:1',
            'origin' => 'sometimes|string|max:255'
        ]);

        $movie->update($validated);

        return response()->json([
            'success' => true,
            'data' => $movie,
            'message' => 'Movie updated successfully'
        ]);
    }

    public function destroy(string $id)
    {
        $movie = Movie::find($id);

        if (!$movie) {
            return response()->json([
                'success' => false,
                'message' => 'Movie not found'
            ], 404);
        }

        $movie->delete();

        return response()->json([
            'success' => true,
            'message' => 'Movie deleted successfully'
        ]);
    }

    public function uploadPoster(Request $request)
    {
        $request->validate([
            'poster' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        try {
            // Сохраняем в папку фронтенда
            $frontendPublicPath = base_path('../frontend/public/images/posters');

            // Создаем папку если не существует
            if (!file_exists($frontendPublicPath)) {
                mkdir($frontendPublicPath, 0755, true);
            }

            // Генерируем уникальное имя файла
            $file = $request->file('poster');
            $fileName = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();

            // Сохраняем файл в папку фронтенда
            $file->move($frontendPublicPath, $fileName);

            // URL будет /images/posters/filename.jpg
            $url = '/images/posters/' . $fileName;

            return response()->json([
                'success' => true,
                'url' => $url,
                'message' => 'Poster uploaded successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload poster: ' . $e->getMessage()
            ], 500);
        }
    }
}