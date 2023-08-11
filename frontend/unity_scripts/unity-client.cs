using UnityEngine;
using TMPro;
using WebSocketSharp;
using UnityEngine.InputSystem;
using StarterAssets;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;

public class WebsocketClient : MonoBehaviour
{
    WebSocket ws;
    float x;
    float y;
    string direction;
    float distance;
    float xRotate;
    float yRotate;
    int distanceRotate;
    bool hasUser;
    string userName;

    StarterAssetsInputs starterAssetsInputs;
    QRCodeGenerator qrCodeGenerator;
    float smoothTime = .01f; // time for smoothing movement
    Vector2 currentVelocity; // current velocity for smoothing movement
    Vector2 targetDirection; // target direction for smoothing movement
    Vector2 targetRotation; // target direction for rotation

    float acceleration = 100f; // acceleration for smoother movement
    Vector2 currentSpeed; // current speed for smoother movement
    Vector2 targetSpeed; // target speed for smoother movement
    Vector2 currentRotation; // current rotation for smoother rotation
    bool hasNewDataSinceLastUpdate;

    public class MoveData
    {
        public string type;
        public float x;
        public float y;
        public string direction;
        public int distance;
        public float xRotate;
        public float yRotate;
        public int distanceRotate;
        public string name;
   
    }

    public float countdownTime = 10f;
    public TextMeshProUGUI countdownText;
    public TextMeshProUGUI userNameText;
    public TextMeshProUGUI qrCTA;
    public TextMeshProUGUI qrCTASmall;
    public RawImage qrCodeImage;
    public RawImage smallQrCodeImage;
    public RawImage logo;
    public GameObject mainCamera;
    public GameObject secondaryCamera;
    public Transform spawnPoint;

    private void Start()
    {
        hasNewDataSinceLastUpdate = false;
        ws = new WebSocket("ws://IP-ADDRESS/api/unity");
        ws.Connect();
        starterAssetsInputs = GetComponent<StarterAssetsInputs>();

        qrCodeGenerator = GetComponent<QRCodeGenerator>();

        if (ws.ReadyState == WebSocketState.Open)
        {
            Debug.Log("WebSocket connection established!");
            ws.Send("{\"type\":\"unity\"}");
            if (qrCodeGenerator != null)
            {
                Debug.Log("ENCONDING QR CODE");
                qrCodeGenerator.EncodeQRCode("http://IP-ADDRESS/");
            }
            else
            {
                Debug.LogError("QR code generator is null!");
            }
        }
        else
        {
            Debug.Log("WebSocket connection failed!");
            return;
        }
        ws.OnClose += (sender, e) =>
        {
            Debug.Log("WebSocket connection closed with code " + e.Code + " and reason " + e.Reason);
            Reconnect();
        };
        ws.OnMessage += (sender, e) =>
        {
            MoveData moveData = JsonUtility.FromJson<MoveData>(e.Data);
    
            Debug.Log("MoveData: type=" + moveData.type + ", x=" + moveData.x + ", y=" + moveData.y + ", direction=" + moveData.direction + ", distance=" + moveData.distance + ", xRotate=" + moveData.xRotate + ", yRotate=" + moveData.yRotate + ", distanceRotate=" + moveData.distanceRotate+ ", name=" + moveData.name);

            if (moveData.type == "newUser")
            {       
                    hasUser = true;
                    countdownTime = 480;
                    userName = moveData.name;
                    secondaryCamera.GetComponent<Animator>().enabled = false; 
                    Debug.Log("New User Coming in!");
            }

          if (moveData.type == "noUsers")
            {       
                    hasUser = false;
                    secondaryCamera.GetComponent<Animator>().enabled = true; 
            }

            // If the message type is "move"
            if (moveData.type == "move")
            {
                hasNewDataSinceLastUpdate = true;
                hasUser = true;
                // Get the movement values from the message
                x = moveData.x;
                y = moveData.y;
                direction = moveData.direction;
                distance = moveData.distance;
                // Debug.Log(JsonUtility.ToJson(moveData));
                // Debug.Log("X: "+ x+" y: "+y+" direction: "+direction+" distance: "+distance);
            }

            if (moveData.type == "rotate")
            {
                hasNewDataSinceLastUpdate = true;
                // Get the movement values from the message
                hasUser = true;
                xRotate = moveData.x;
                yRotate = moveData.y;
                distanceRotate = moveData.distance * 10;
                // Debug.Log(JsonUtility.ToJson(moveData));
                // Debug.Log("X: "+ x+" y: "+y+" direction: "+direction+" distance: "+distance);
            }
        };
    }

private void FixedUpdate()
{

if (hasNewDataSinceLastUpdate){
    // Use x and y to set the target direction for the movement and rotation
    targetDirection = new Vector2(x, y).normalized;
    targetRotation = new Vector2(xRotate / 2 , yRotate * -1 / 2);
    // Apply acceleration to the target speed
    targetSpeed = targetDirection * distance * acceleration;
    // Smooth the movement over time
    currentSpeed = Vector2.SmoothDamp(currentSpeed, targetSpeed, ref currentVelocity, smoothTime);
    // Set the movement values in the StarterAssetsInputs component
    starterAssetsInputs.move = new Vector2(currentSpeed.x , currentSpeed.y);
    starterAssetsInputs.look = targetRotation;
    hasNewDataSinceLastUpdate = false;
} else {

    // Reset the movement values
    x = 0;
    y = 0;
    xRotate = 0;
    yRotate = 0;

    // Use x and y to set the target direction for the movement and rotation
    targetDirection = new Vector2(x, y).normalized;
    targetRotation = new Vector2(xRotate / 2 , yRotate * -1 / 2);
    // Apply acceleration to the target speed
    targetSpeed = targetDirection * distance * acceleration;
    // Smooth the movement over time
    currentSpeed = Vector2.SmoothDamp(currentSpeed, targetSpeed, ref currentVelocity, smoothTime);
    // Smoothly interpolate between the current rotation and the target rotation
    currentRotation = Vector2.Lerp(currentRotation, targetRotation, smoothTime);
    // Set the movement values in the StarterAssetsInputs component
    starterAssetsInputs.move = new Vector2(currentSpeed.x , currentSpeed.y);
    // Set the rotation of the camera to the current rotation
    starterAssetsInputs.look = currentRotation;
}
   
    if(hasUser){
        qrCodeImage.enabled = false;
        smallQrCodeImage.enabled = true;
        logo.enabled = false;
        qrCTA.gameObject.SetActive(false);
        qrCTASmall.gameObject.SetActive(true);
        mainCamera.SetActive(true);
        secondaryCamera.SetActive(false);
        userNameText.text = "Current Player: "+userName;
    } else {
        transform.position = spawnPoint.position;
        transform.rotation = spawnPoint.rotation;
        qrCodeImage.enabled = true;
        smallQrCodeImage.enabled = false;
        logo.enabled = true;
        qrCTA.gameObject.SetActive(true);
        qrCTASmall.gameObject.SetActive(false);
        mainCamera.SetActive(false);
        secondaryCamera.SetActive(true);
        userNameText.text = "";
        countdownText.text = "";
    }


    // Countdown timer logic
    if(hasUser){
    if (countdownTime <= 0)
    {
        hasUser = false;
        countdownTime = 0;
        countdownText.text = "Time's up!";
    }
    else
    {
        countdownTime -= Time.deltaTime;
        int minutes = Mathf.FloorToInt(countdownTime / 60);
        int seconds = Mathf.FloorToInt(countdownTime % 60);
        countdownText.text = "Time left: " + minutes.ToString("00") + ":" + seconds.ToString("00");
    }
    }
}
    private void Reconnect()
    {
        Debug.Log("Reconnecting to WebSocket server...");
        ws = new WebSocket("ws://IP-ADDRESS/api/unity");
        ws.Connect();

         ws.OnClose += (sender, e) =>
        {
            Debug.Log("WebSocket connection closed with code " + e.Code + " and reason " + e.Reason);
            Reconnect();
        };
        ws.OnMessage += (sender, e) =>
        {
            MoveData moveData = JsonUtility.FromJson<MoveData>(e.Data);
    
            Debug.Log("MoveData: type=" + moveData.type + ", x=" + moveData.x + ", y=" + moveData.y + ", direction=" + moveData.direction + ", distance=" + moveData.distance + ", xRotate=" + moveData.xRotate + ", yRotate=" + moveData.yRotate + ", distanceRotate=" + moveData.distanceRotate+ ", name=" + moveData.name);

            if (moveData.type == "newUser")
            {       
                    hasUser = true;
                    countdownTime = 480;
                    userName = moveData.name;
                    secondaryCamera.GetComponent<Animator>().enabled = false; 
                    Debug.Log("New User Coming in!");
            }

          if (moveData.type == "noUsers")
            {       
                    hasUser = false;
                    secondaryCamera.GetComponent<Animator>().enabled = true; 
            }

            // If the message type is "move"
            if (moveData.type == "move")
            {
                hasNewDataSinceLastUpdate = true;
                hasUser = true;
                // Get the movement values from the message
                x = moveData.x;
                y = moveData.y;
                direction = moveData.direction;
                distance = moveData.distance;
                // Debug.Log(JsonUtility.ToJson(moveData));
                // Debug.Log("X: "+ x+" y: "+y+" direction: "+direction+" distance: "+distance);
            }

            if (moveData.type == "rotate")
            {
                hasNewDataSinceLastUpdate = true;
                // Get the movement values from the message
                hasUser = true;
                xRotate = moveData.x;
                yRotate = moveData.y;
                distanceRotate = moveData.distance * 10;
                // Debug.Log(JsonUtility.ToJson(moveData));
                // Debug.Log("X: "+ x+" y: "+y+" direction: "+direction+" distance: "+distance);
            }
        };
        // ...
    }

}