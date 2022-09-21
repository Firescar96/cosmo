# Cosmo
This is a journaling app

It accepts posts in markdown, saves them to a strapi database, uses GPT3 to generate summaries, and uses a local instance of stable diffusion to generate images associated with those summaries.

My GPU has 8GB of VRAM, less than the 10 required for the canonical version of stable-diffusion so I copied the `optimizedSD/optimized_txt2img.py` script from [basujindal/stable-diffusion](https://github.com/basujindal/stable-diffusion)