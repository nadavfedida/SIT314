const mongoose = require('mongoose');
const readline = require('readline');

// To use with local web version of MONGODB
// mongoose.connect('mongodb://44.203.100.174:27017/lights');


// To use with AWS instance with MONGODB
const mongoDbUrl = 'mongodb://3.89.10.187:27017/lights'; 

mongoose.connect(mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');

    const Light = mongoose.model('Light', {
      _id: Number,
      location: String,
      brightness: Number,
      status: String,
      time: Date
    });

    // Generate a timestamp
    const generateTimestamp = () => {
      return new Date();
      };

    try {
      const lights = await Light.find({});

      lights.sort((a, b) => a.id.localeCompare(b.id));

      const lightsById = {};


      lights.forEach(light => {
        lightsById[light.id] = light;
      });

      // Print all lights
      console.log('Retrieved lights data indexed by id:', printAllLightsData(lights));

      // Create a readline interface for user input
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      // Main menu
      const mainMenu = () => {
        console.log('\x1b[36m%s\x1b[0m', '\nOptions:');
        console.log('1. Modify an entry');
        console.log('2. Print Lights data');
        console.log('3. Master Off');
        console.log('4. Add new light');
        console.log('5. Delete all lights');
        console.log('6. Exit');
        rl.question('Enter your choice: ', (choice) => {
          switch (choice) {
            case '1':
              modifyEntryMenu();
              break;
            case '2':
              DisplayData();
              break;
            case '3':
              masterOff(lights);
              break;
            case '4':
              addNewLight(lights);
              break;
            case '5':
              confirmDelete();
              break;
            case '6':
              rl.close();
              console.log('\x1b[31m', 'Disconnecting from MQTT broker');
              mongoose.connection.close();
              break;
            default:
              console.log('\x1b[31m', 'Invalid choice. Please enter 1, 2, 3, 4, 5 or 6.');
              mainMenu();
              break;
          }
        });
      };

      // Modify entry menu
      const modifyEntryMenu = () => {
        console.log('\x1b[36m%s\x1b[0m', '\All lights:\n');
        printAllLightsData(lights);
        console.log('\x1b[36m%s\x1b[0m', '\nModify Entry:');
        rl.question(`Enter the index of the entry to modify (0- ${lights.length - 1}), or 'q' to return to the main menu: \n`, (answer) => {
          if (answer.toLowerCase() === 'q') {
            mainMenu();
          }
          else {
            const index = parseInt(answer);
            if (isNaN(index) || index < 0 || index >= lights.length) {
              console.log('\x1b[31m', 'Invalid input. Please enter a valid index or "q" to return to the main menu.');
              modifyEntryMenu();
            }
            else {
              const selectedLight = lights[index];
              console.log('\x1b[36m%s\x1b[0m', '\nSelected Light:', selectedLight);
              updateMenu(selectedLight);
            };
          };
        });
      };

      // Display lights data
      const DisplayData = async () => {
        const lights = await Light.find({});

        console.log('\x1b[36m%s\x1b[0m', '\nLights Data:');
        printAllLightsData(lights);
        mainMenu();
      };

      // Add new light function
      const addNewLight = async () => {
        console.log('\x1b[36m%s\x1b[0m', '\nAdd New Light:');
        const lights = await Light.find({});
        const newLight = new Light();

        rl.question('Enter location: \n1:HOME \n2:OFFICE1 \n3:OFFICE2 \n4:OFFICE3', async (locationInput) => {
          const locationOptions = ["HOME", "OFFICE1", "OFFICE2", "OFFICE3"];
          const newLocation = parseInt(locationInput);
          if (newLocation > 0 || newLocation < locationOptions.length) {
            // if (locationOptions.includes(locationInput.toUpperCase())) {
            newLight.location = locationOptions[newLocation - 1];
            console.log(locationOptions[newLocation - 1]);

            rl.question('Enter brightness (0-100): ', async (brightnessInput) => {
              const newBrightness = parseInt(brightnessInput);

              if (isNaN(newBrightness) || newBrightness < -1 || newBrightness > 101) {
                console.log('Invalid brightness value. Please enter a value between 0 and 100.');
                addNewLight();
              } else {
                newLight.brightness = newBrightness;

                rl.question('Enter status: \n1:ON  \n2:OFF', async (statusInput) => {
                  const StatusOptions = ["ON", "OFF"];
                  // const status = statusInput.toUpperCase();
                  if (statusInput < 1 || statusInput > 2) {
                    // if (status !== 'ON' && status !== 'OFF') {
                    console.log('Invalid status. Please enter "ON" or "OFF".');
                    addNewLight();
                  } else {
                    newLight.status = StatusOptions[statusInput - 1];

                    // Set a timestamp (current time)
                    newLight.time = generateTimestamp();

                    // Set ID for new light
                    newLight._id = lights.length;

                    // Save the new light document
                    try {
                      await newLight.save();
                      // );
                      console.log('New light added and saved.');
                      mainMenu();
                    } catch (err) {
                      console.error('Error saving new light:', err);
                      mainMenu();
                    }
                  }
                });
              }
            });
          } else {
            console.log('Invalid location. Please enter a valid location (1-4).');
            addNewLight();
          }
        });
      };

      // Delete all data function
      const deleteAllData = async () => {
        try {
          // Delete all lights in the database
          await Light.deleteMany({});

          console.log('\x1b[31m', 'All data has been deleted.');
          mainMenu();
        } catch (err) {
          console.error('Error deleting data:', err);
          mainMenu();
        }
      };


      // Confirm delete function
      const confirmDelete = () => {
        try {
          rl.question('\nAre you sure you want to delete all data: \n1:YES \n2:NO\n', async (answer) => {
            const UserAnswer = parseInt(answer);
            if (UserAnswer === 1) {
              deleteAllData();
            } else if (UserAnswer === 2) {
              console.log('\nReturning.');
              mainMenu();
            } else {
              console.log("\nPlease enter a valid selection.")
              confirmDelete();
            }
          });
        } catch (err) {
          console.error('Error deleting data:', err);
          mainMenu();
        }
      };


      // Update menu
      const updateMenu = (selectedLight) => {
        console.log('\x1b[36m%s\x1b[0m', '\nUpdate Options:');
        console.log('1. Update brightness');
        console.log('2. Update status');
        console.log('3. Return to main menu');
        rl.question('Enter your choice (1, 2, or 3): ', (choice) => {
          switch (choice) {
            case '1':
              updateBrightness(selectedLight);
              break;
            case '2':
              updateStatus(selectedLight);
              break;
            case '3':
              mainMenu();
              break;
            default:
              console.log('\x1b[31m', 'Invalid choice. Please enter 1, 2, or 3.');
              updateMenu(selectedLight);
              break;
          }
        });
      };

      // Update brightness
      const updateBrightness = (selectedLight) => {
        rl.question('Enter the new brightness value (0-100): ', async (newBrightnessInput) => {
          const newBrightness = parseInt(newBrightnessInput);

          if (isNaN(newBrightness) || newBrightness < 0 || newBrightness > 100) {
            console.log('\x1b[31m', 'Invalid brightness value. Please enter a value between 0 and 100.');
            updateBrightness(selectedLight);
          } else {
            // Update the selected light's brightness
            selectedLight.brightness = newBrightness;

            // Save the updated light document
            await selectedLight.save();

            console.log(selectedLight);
            console.log('Brightness updated and saved.');
            updateMenu(selectedLight);
          }
        });
      };


      // Update status
      const updateStatus = (selectedLight) => {
        // Toggle the status between "on" and "off"
        if (selectedLight.status == "OFF") selectedLight.status = "ON";
        else if (selectedLight.status == "ON") selectedLight.status = "OFF";
        console.log(selectedLight);

        // Save the updated light document
        selectedLight.save();
        updateMenu(selectedLight);
      };


      // Master Off function
      const masterOff = async (lights) => {
        try {
          // Iterate through the lights and turn them off
          for (const light of lights) {
            if (light.status == "ON") light.status = "OFF";
            light.save();
          }
          console.log(lights);
          console.log('All lights have been turned off.');
          mainMenu();
        } catch (err) {
          console.error('Error turning off lights:', err);
          mainMenu();
        }
      };


      // Start with the main menu
      mainMenu();
    } catch (err) {
      console.error('\x1b[31m', 'Error retrieving data:', err);
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('\x1b[31m', 'MongoDB connection error:', err);
  });

function printAllLightsData(lightsById) {
  for (const id in lightsById) {
    console.log(lightsById[id]);
  }
}
