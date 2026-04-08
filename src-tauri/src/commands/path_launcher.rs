use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

#[cfg(target_os = "linux")]
use std::path::Path;

#[cfg(target_os = "linux")]
fn is_desktop(path: &Path) -> bool {
    if !path.is_file() {
        return false;
    }

    if path.extension().and_then(|e| e.to_str()) != Some("desktop") {
        return false;
    }

    std::fs::read_to_string(path)
        .map(|c| c.contains("[Desktop Entry]"))
        .unwrap_or(false)
}

#[tauri::command]
pub fn path_launcher(app: AppHandle, path: String) -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        use std::fs;
        use std::os::unix::fs::PermissionsExt;
        use std::process::Command;

        let p = Path::new(&path);

        if is_desktop(p) {
            let status = Command::new("gio")
                .arg("launch")
                .arg(&path)
                .status()
                .map_err(|e| format!("Failed to open path: {e}"))?;

            return if status.success() {
                Ok(())
            } else {
                Err(format!("Failed to open path: {status}"))
            };
        }

        if !p.is_file() {
            return Err("Path is not a file".into());
        }

        let metadata = fs::metadata(p).map_err(|e| e.to_string())?;
        let mode = metadata.permissions().mode();

        if mode & 0o111 != 0 {
            Command::new(p)
                .spawn()
                .map_err(|e| format!("Failed to open path: {e}"))?;
            Ok(())
        } else {
            app.opener()
                .open_path(&path, None::<&str>)
                .map_err(|e| format!("Failed to open path: {e}"))
        }
    }

    #[cfg(not(target_os = "linux"))]
    {
        app.opener()
            .open_path(&path, None::<&str>)
            .map_err(|e| format!("Failed to open path: {e}"))
    }
}