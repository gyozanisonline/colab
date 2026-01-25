#!/bin/bash
# Navigate to the video directory
cd "assets/Video Gallery Content"

# Create a temporary directory for trimmed output
mkdir -p trimmed

# Iterate over all .mov files
for file in *.mov; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        # -ss 00:00:00 : start at beginning
        # -t 8 : duration 8 seconds
        # -c:v libx264 : use H.264 codec
        # -crf 23 : constant rate factor (quality/size balance)
        # -preset medium : encoding speed/compression balance
        # -c:a aac : audio codec
        # -y : overwrite output
        ffmpeg -y -i "$file" -ss 00:00:00 -t 8 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k "trimmed/$file"
    fi
done

# Verify trimming happened
count=$(ls trimmed/*.mov 2>/dev/null | wc -l)
if [ "$count" -gt 0 ]; then
    echo "Replacing original files with trimmed versions..."
    mv trimmed/*.mov .
    rmdir trimmed
    echo "Success! All videos trimmed to 8 seconds."
else
    echo "No files processed. Checking if ffmpeg worked..."
    ls -l trimmed
fi
