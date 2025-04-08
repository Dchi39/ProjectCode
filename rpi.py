import asyncio
import websockets
import RPi.GPIO as GPIO
import smbus  # I2C library
import time

I2C_ADDR = 0x08  # Arduino I2C address
bus = smbus.SMBus(1)

# Pin definitions for motors
IN1 = 17
IN2 = 18
IN3 = 22
IN4 = 23
ENA = 24
ENB = 25

# Pin definitions for IR sensors
LEFT_SENSOR = 4
RIGHT_SENSOR = 5

# WebSocket server URI
uri = "ws://192.168.8.105:6792"

# GPIO setup
GPIO.setmode(GPIO.BCM)
GPIO.setup([IN1, IN2, IN3, IN4, ENA, ENB], GPIO.OUT)
GPIO.setup([LEFT_SENSOR, RIGHT_SENSOR], GPIO.IN)

# PWM setup
pwmA = GPIO.PWM(ENA, 100)  
pwmB = GPIO.PWM(ENB, 100)
pwmA.start(0)
pwmB.start(0)

# Global variables
web_control_active = False  
follow_task = None  # Stores follow_line() task

def send_i2c_command(command):
    try:
        bus.write_byte(I2C_ADDR, ord(command))
        print(f"Sent '{command}' to Arduino via I2C")
    except Exception as e:
        print(f"I2C error: {e}")

def motors_forward():
    GPIO.output([IN1, IN3], GPIO.HIGH)
    GPIO.output([IN2, IN4], GPIO.LOW)
    pwmA.ChangeDutyCycle(50)
    pwmB.ChangeDutyCycle(50)

def motors_left():
    GPIO.output([IN1, IN4], GPIO.LOW)
    GPIO.output([IN2, IN3], GPIO.HIGH)
    pwmA.ChangeDutyCycle(50)
    pwmB.ChangeDutyCycle(50)

def motors_right():
    GPIO.output([IN1, IN4], GPIO.HIGH)
    GPIO.output([IN2, IN3], GPIO.LOW)
    pwmA.ChangeDutyCycle(50)
    pwmB.ChangeDutyCycle(50)

def motors_stop():
    GPIO.output([IN1, IN2, IN3, IN4], GPIO.LOW)
    pwmA.ChangeDutyCycle(0)
    pwmB.ChangeDutyCycle(0)

def read_sensors():
    return GPIO.input(LEFT_SENSOR), GPIO.input(RIGHT_SENSOR)

async def listen_for_arduino():
    """ Waits for 'D' from Arduino and resumes follow_line(). """
    global web_control_active

    while web_control_active:  
        try:
            response = bus.read_byte(I2C_ADDR)
            if response == ord('D'):  
                print("✅ Received 'D' from Arduino! Resuming follow_line()...")
                return  # Exit function and resume follow_line()
        except Exception as e:
            print(f"❌ Error reading from Arduino: {e}")

        await asyncio.sleep(0.5)

async def follow_line():
    """ Continuously follows the line unless 'off' is pressed. """
    global web_control_active

    while web_control_active:  
        left_detected, right_detected = read_sensors()

        if left_detected and not right_detected:
            motors_left()
        elif right_detected and not left_detected:
            motors_right()
        elif left_detected and right_detected:
            motors_forward()
        else:
            motors_stop()
            print("No line detected. Sending 'S' to Arduino.")
            send_i2c_command("S")

            # Wait for Arduino to send 'D' before continuing
            await listen_for_arduino()
        
        await asyncio.sleep(0.1)

async def raspberry_pi_client():
    global web_control_active, follow_task

    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket server.")

            async def handle_server_messages():
                global web_control_active, follow_task

                while True:
                    try:
                        message = await websocket.recv()
                        print(f"Message from server: {message}")

                        if message == "start":
                            web_control_active = True

                            if follow_task is None or follow_task.done():
                                follow_task = asyncio.create_task(follow_line())  # Start motors
                        
                        elif message == "off":
                            web_control_active = False
                            motors_stop()
                            send_i2c_command("N")  # Stop Arduino task

                            if follow_task and not follow_task.done():
                                follow_task.cancel()  # Stop following line

                    except Exception as e:
                        print(f"WebSocket error: {e}")
                        break

            asyncio.create_task(listen_for_arduino())
            await handle_server_messages()

    except Exception as e:
        print(f"Connection error: {e}")
    finally:
        GPIO.cleanup()

asyncio.run(raspberry_pi_client())
