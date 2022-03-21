import { renderText } from '../src/index';
import { promises as fs } from "fs"

const exampleCom = `####### ### ##### #######
#     # #  ## #   #     #
# ### #    ### ## # ### #
# ### # # #   ##  # ### #
# ### # ## #   ## # ### #
#     #   # # #   #     #
####### # # # # # #######
         #  #  ##        
#     ## #  #    #  ## ##
 #  #   ## ##      ## ## 
 ##  #### ##    ## # # ##
#   #  ## ### ## ##      
# ## ##  # ## #  # ## #  
  ###  ########  #  #   #
# # ###  #   #  ## ######
       # ## ###    ## ## 
 ########## ### ######  #
         ###   ##   ###  
####### #  ## ### # ##  #
#     #  ####  ##   #  # 
# ### #  ##  ## ##### ## 
# ### #  ###  ##      # #
# ### #  # #  ####    ## 
#     #  # # ## ## # ### 
####### # ### ##  # #####`;

// import crypto from "crypto"
// await fs.writeFile("./test/resources.txt", "");
// for (let i = 1; i < 4096; i += 10) {
//   const randomStr = crypto.randomBytes(i).toString("hex")

//   const code = renderText({ value: randomStr });

//   await fs.appendFile(`./test/resources.txt`, `${randomStr}:${code}\t`) // seperator is &&\n
// }

test('Ensure base example.com example is valid', () => {
  expect(renderText({ value: 'https://example.com' })).toBe(exampleCom);
});

test('Ensure all resources are valid', async () => {
  const resourceText = await fs.readFile("./test/resources.txt", "utf-8")

  for (const entry of resourceText.split("\t")) {

    if (!entry) continue;

    const key = entry.split(":")[0]
    const value = entry.split(":")[1]

    expect(renderText({ value: key })).toBe(value)
  }
})

test('Ensure options can be passed to text renderer', () => {
  expect(renderText({
    value: 'https://example.com',
    foregroundChar: '█',
    backgroundChar: ' '
  })).toBe(exampleCom.replaceAll('#', '█'));
});
