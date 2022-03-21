import { renderText } from '../src/index';

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

test('Ensure base example.com example is valid', () => {
  expect(renderText({ value: 'https://example.com' })).toBe(exampleCom);
});

test('Ensure options can be passed to text renderer', () => {
  expect(renderText({
    value: 'https://example.com',
    foregroundChar: '█',
    backgroundChar: ' '
  })).toBe(exampleCom.replaceAll('#', '█'));
});
