from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/taskmate"
    secret_key: str = "change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    cloudinary_url: str = ""
    supabase_url: str = ""
    supabase_key: str = ""

    allowed_origins: str = "*"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
