# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 7860 for Hugging Face
EXPOSE 7860

# Run the application using gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app"]
