use base64::{engine::general_purpose, Engine as _};
use windows_icons::get_icon_base64_by_path;

#[tauri::command]
pub fn get_system_icon_base64(path: String, size: i32) -> Option<String> {
    let png_bytes: Vec<u8> = platform_icon_png(&path, size).ok()?;
    let b64 = general_purpose::STANDARD.encode(png_bytes);
    Some(format!("data:image/png;base64,{}", b64))
}

#[cfg(windows)]
fn platform_icon_png(path: &str, _size: i32) -> Result<Vec<u8>, ()> {
    let b64 = get_icon_base64_by_path(path).map_err(|_| ())?;

    let bytes = base64::engine::general_purpose::STANDARD
        .decode(b64)
        .map_err(|_| ())?;

    Ok(bytes)
}

#[cfg(not(windows))]
fn platform_icon_png(path: &str, size: i32) -> Result<Vec<u8>, ()> {
    let ext = std::path::Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| format!(".{}", e))
        .ok_or(())?;

    systemicons::get_icon(&ext, size).map_err(|_| ())
}
