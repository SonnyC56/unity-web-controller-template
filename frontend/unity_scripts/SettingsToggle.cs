using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;
using TMPro;

public class ToggleSettings : MonoBehaviour
{
    public Slider lookSlider;
    public TextMeshProUGUI lookSliderTitle;
    public Slider moveSlider;
    public TextMeshProUGUI moveSliderTitle;
    public InputAction hotkey;
    public Button exitButton;

    public void QuitGame()
    {
        Application.Quit();
    }

    private void OnEnable()
    {
        hotkey.Enable();
        hotkey.performed += OnHotkeyPerformed;
    }

    private void OnDisable()
    {
        hotkey.Disable();
        hotkey.performed -= OnHotkeyPerformed;
    }

    private void OnHotkeyPerformed(InputAction.CallbackContext context)
    {
        Debug.Log("Hotkey triggered");
        if (lookSlider.gameObject.activeSelf)
        {
            Debug.Log("Hiding slider");
            lookSlider.gameObject.SetActive(false);
            lookSliderTitle.gameObject.SetActive(false);
            moveSlider.gameObject.SetActive(false);
            moveSliderTitle.gameObject.SetActive(false);
            exitButton.gameObject.SetActive(false);
        }
        else
        {
            Debug.Log("Showing slider");
            lookSlider.gameObject.SetActive(true);
            lookSliderTitle.gameObject.SetActive(true);
            moveSlider.gameObject.SetActive(true);
            moveSliderTitle.gameObject.SetActive(true);
            exitButton.gameObject.SetActive(true);
        }

        // Re-enable the input action so it can be triggered again
        hotkey.Enable();
    }
}