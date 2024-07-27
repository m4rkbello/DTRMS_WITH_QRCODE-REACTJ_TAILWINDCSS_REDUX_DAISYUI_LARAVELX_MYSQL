<?php

namespace App\Http\Controllers;

use App\Models\Overtime;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;

class OvertimeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $data = Overtime::all();

            return response()->json([
                'department' => $data,
                'success' => true,
                'status' => 201,
            ], 201);

        }catch(\Exception $error){

            return response()->json([
                'success' => false,
                'status' => 401,
                'message' => 'Fetch all Overtimes have unsuccessful!',
                'error' => $error,
            ], 401);
        
        };
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'overtime_name' => 'required|string',
                'overtime_hour' => 'required|integer',
                'overtime_rate_per_hour' => 'required|integer',
                'overtime_description' => 'required|string',
                'overtime_status_id' => 'required|integer',
            ]);

            $overtime_collection = Overtime::create([
                'overtime_name' => $data['overtime_name'],
                'overtime_hour' => $data['overtime_hour'],
                'overtime_rate_per_hour' => $data['overtime_rate_per_hour'],
                'overtime_description' => $data['overtime_description'],
                'overtime_status_id' => $data['overtime_status_id'],
                'created_by' => auth()->id(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

            $response_data = [
                'status' => 201,
                'success' => true,
                'message' => 'Overtime has successfully created!',
                'data' => $overtime_collection,
            ];

            return response($response_data, 201);

        } catch (ValidationException $e) {

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'status' => 422,
                'errors' => $e->errors(),
            ], 422);

        } catch (ModelNotFoundException $e) {

            return response()->json([
                'success' => false,
                'message' => 'Rate not found',
                'status' => 404,
            ], 404);

        } catch (\Exception $error) {

            return response()->json([
                'success' => false,
                'message' => 'An error occurred',
                'status' => 500,
                'errors' => $error->getMessage(),
            ], 500);
            
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function search(Request $request)
    {
        //EVALIDATE NA TAAS PANG GIINPUT OR GAMAY!
        $validator = Validator::make($request->all(), [
            'data' => 'required|string|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid search input.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $request->input('data');

            $overtime = Overtime::where('id', 'like', '%' . $data . '%')
                ->orWhere('overtime_name', 'like', '%' . $data . '%')
                ->orWhere('overtime_hour', 'like', '%' . $data . '%')
                ->orWhere('overtime_rate_per_hour', 'like', '%' . $data . '%')
                ->orWhere('overtime_description', 'like', '%' . $data . '%')
                ->get();

            if ($overtime->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No overtime found for the given search criteria.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'status' => 200,
                'message' => 'Overtime found!',
                'data' => $overtime,
            ], 200);

        } catch (\Exception $e) {
            // Log the error for further analysis
            \Log::error('Error in search method: ' . $e->getMessage(), ['exception' => $e]);

            // Return a more detailed error message only if in debug mode
            $errorMessage = config('app.debug') ? $e->getMessage() : 'Failed to search overtime. Please try again later.';

            return response()->json([
                'success' => false,
                'message' => $errorMessage,
            ], 500);
        }
    }
}
