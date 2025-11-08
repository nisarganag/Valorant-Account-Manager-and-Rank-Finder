# Account Import Guide

This guide explains how to prepare files for importing accounts into Valorant Account Manager.

## Supported File Formats

### 📄 JSON Format (.json)

**Structure:** Array of account objects

```json
[
  {
    "riotId": "PlayerName1",
    "hashtag": "1234",
    "username": "player1@email.com",
    "password": "password123",
    "region": "na",
    "hasSkins": true,
    "currentRank": "Diamond 2"
  },
  {
    "riotId": "PlayerName2",
    "hashtag": "5678", 
    "username": "player2@email.com",
    "password": "password456",
    "region": "eu",
    "hasSkins": false,
    "currentRank": "Platinum 1"
  }
]
```

### 📊 CSV Format (.csv)

**Structure:** Comma-separated values with headers

```csv
riotId,hashtag,username,password,region,hasSkins,currentRank
PlayerName1,1234,player1@email.com,password123,na,true,Diamond 2
PlayerName2,5678,player2@email.com,password456,eu,false,Platinum 1
PlayerName3,9999,player3@email.com,password789,ap,true,Gold 3
```

## Field Descriptions

| Field | Required | Description | Example Values |
|-------|----------|-------------|----------------|
| `riotId` | ✅ **Yes** | Riot ID display name | `"PlayerName"` |
| `hashtag` | ✅ **Yes** | Riot ID tag (without #) | `"1234"` |
| `username` | ❌ No | Login username/email | `"player@email.com"` |
| `password` | ❌ No | Account password | `"mypassword123"` |
| `region` | ❌ No | Game region | `"na"`, `"eu"`, `"ap"`, `"br"`, `"kr"`, `"latam"` |
| `hasSkins` | ❌ No | Has skins (boolean) | `true`, `false` |
| `currentRank` | ❌ No | Current competitive rank | `"Diamond 2"`, `"Platinum 1"` |

### Alternative Field Names (Legacy Support)

The importer also accepts these alternative field names:
- `tag` instead of `hashtag`
- `username` can be used as `riotId` if `riotId` is missing

## Regional Codes

| Region | Code |
|--------|------|
| North America | `na` |
| Europe | `eu` |
| Asia Pacific | `ap` |
| Brazil | `br` |
| Korea | `kr` |
| Latin America | `latam` |

## Rank Names (Optional)

Valid rank names for the `currentRank` field:
- `Unranked`
- `Iron 1`, `Iron 2`, `Iron 3`
- `Bronze 1`, `Bronze 2`, `Bronze 3`
- `Silver 1`, `Silver 2`, `Silver 3`
- `Gold 1`, `Gold 2`, `Gold 3`
- `Platinum 1`, `Platinum 2`, `Platinum 3`
- `Diamond 1`, `Diamond 2`, `Diamond 3`
- `Ascendant 1`, `Ascendant 2`, `Ascendant 3`
- `Immortal 1`, `Immortal 2`, `Immortal 3`
- `Radiant`

## Example Files

### Minimal JSON (Required fields only)
```json
[
  {
    "riotId": "Player1",
    "hashtag": "1234"
  },
  {
    "riotId": "Player2", 
    "hashtag": "5678"
  }
]
```

### Minimal CSV (Required fields only)
```csv
riotId,hashtag
Player1,1234
Player2,5678
```

### Complete JSON (All fields)
```json
[
  {
    "riotId": "ProPlayer",
    "hashtag": "GOAT",
    "username": "proplayer@riot.com",
    "password": "supersecret123",
    "region": "na",
    "hasSkins": true,
    "currentRank": "Radiant"
  },
  {
    "riotId": "CasualGamer",
    "hashtag": "FUN",
    "username": "casual@gmail.com", 
    "password": "password456",
    "region": "eu",
    "hasSkins": false,
    "currentRank": "Gold 2"
  }
]
```

## Security Notes

⚠️ **Important:** 
- Passwords are encrypted using AES-256 encryption before storage
- Files are processed locally - no data is sent to external servers
- Consider using a secure password manager for password storage
- Delete import files after successful import for security

## File Size Limits

- Maximum file size: 100MB
- Recommended: Under 10MB for optimal performance
- No limit on number of accounts (within file size constraints)

## Troubleshooting

### Common Issues

1. **"Please select a supported file format"**
   - Ensure file extension is `.json` or `.csv`
   - Check that file is not corrupted

2. **"Failed to process file"**
   - Verify JSON syntax is valid (use JSONLint.com)
   - Check CSV has proper headers and formatting
   - Ensure required fields (`riotId`, `hashtag`) are present

3. **"File is too large"**
   - File exceeds 100MB limit
   - Split into smaller files or remove unnecessary data

### Validation

Before importing, verify:
- ✅ File has correct extension (`.json` or `.csv`)
- ✅ Required fields are present and not empty
- ✅ JSON syntax is valid (if using JSON)
- ✅ CSV headers match expected field names (if using CSV)
- ✅ Region codes are valid
- ✅ Boolean values are `true`/`false` (not `1`/`0`)

## Export from Other Tools

### From Excel/Google Sheets
1. Create columns: `riotId`, `hashtag`, `username`, `password`, `region`, `hasSkins`, `currentRank`
2. Fill in your account data
3. Export as CSV file
4. Import into Valorant Account Manager

### From Other Account Managers
1. Export data to JSON or CSV format
2. Map field names to match expected format
3. Ensure required fields are included
4. Import into Valorant Account Manager

---

**Need help?** Open an issue on GitHub with your file format questions!