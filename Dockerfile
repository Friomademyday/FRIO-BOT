RUN apt-get update && apt-get install -y libatk-1.0-0

# Copy your application code
COPY . /workspace

# Install dependencies
RUN npm install

# Expose the port
EXPOSE 8000

# Run the command to start your application
CMD ["node", "index.js"]
